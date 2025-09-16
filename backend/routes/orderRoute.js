import express from "express";
import Order from "../models/orderModel.js";
import Medicine from "../models/medicineModel.js";
import User from "../models/userModel.js";
import { authUser } from "../middlewares/authUser.js";
import { authAdmin } from "../middlewares/authAdmin.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

// Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
router.post("/checkout", authUser, async (req, res) => {
  try {
    const { cart } = req.body;
    if (!cart || cart.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    let totalAmount = 0;
    for (let item of cart) {
      const med = await Medicine.findById(item._id);
      if (!med) return res.status(400).json({ success: false, message: "Medicine not found" });
      if (med.stock < item.qty)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${med.name}` });
      totalAmount += med.price * item.qty;
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      userId: req.user.id,
      medicines: cart.map((item) => ({ medicineId: item._id, quantity: item.qty })),
      totalAmount,
      status: "Pending",
      razorpayOrderId: razorpayOrder.id,
    });

    res.json({ success: true, orderId: order._id, razorpayOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Verify payment & send email
router.post("/verify", authUser, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id }).populate("medicines.medicineId");
    if (!order) return res.status(400).json({ success: false, message: "Order not found" });

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Invalid payment signature" });

    // Update stock
    for (let item of order.medicines) {
      const med = await Medicine.findById(item.medicineId._id);
      if (med) {
        med.stock -= item.quantity;
        await med.save();
      }
    }

    order.status = "Paid";
    await order.save();

    // Send order confirmation email
    const user = await User.findById(order.userId);
    if (user && user.email) {
      const emailOptions = {
        to: user.email,
        subject: `Order Confirmation - AJ Hospitals`,
        text: `Hello ${user.name},\nYour order (ID: ${order._id}) has been successfully placed.\nTotal Amount: ₹${order.totalAmount}`,
        html: `
          <h2>Order Confirmation - AJ Hospitals</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your order <strong>ID: ${order._id}</strong> has been successfully placed.</p>
          <p>Total Amount: <strong>₹${order.totalAmount}</strong></p>
          <h3>Order Details:</h3>
          <ul>
            ${order.medicines.map(
              (item) =>
                `<li>${item.quantity} × ${item.medicineId.name} (₹${item.medicineId.price} each)</li>`
            ).join("")}
          </ul>
          <p>Thank you for shopping with AJ Hospitals!</p>
        `,
      };
      await sendEmail(emailOptions);
    }

    res.json({ success: true, message: "Payment verified & email sent", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user's orders
router.get("/myOrders", authUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("medicines.medicineId", "name price imageUrl")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: get all orders
router.get("/admin/orders", authAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findById(order.userId).select("name email").lean();
        const medicines = await Promise.all(
          order.medicines.map(async (item) => {
            const med = await Medicine.findById(item.medicineId).select("name price").lean();
            return {
              medicineId: med?._id || null,
              name: med?.name || "Deleted Medicine",
              price: med?.price || 0,
              quantity: item.quantity,
            };
          })
        );
        return { ...order, userId: user || { name: "Deleted User", email: "" }, medicines };
      })
    );
    res.json({ success: true, data: ordersWithDetails });
  } catch (err) {
    console.error("Admin Fetch Orders Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
