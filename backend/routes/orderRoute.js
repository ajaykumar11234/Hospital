import express from "express";
import Order from "../models/orderModel.js";
import Medicine from "../models/medicineModel.js";
import User from "../models/userModel.js";
import { authUser } from "../middlewares/authUser.js";
import { authAdmin } from "../middlewares/authAdmin.js";
import Razorpay from "razorpay";
import crypto from "crypto";

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
        return res
          .status(400)
          .json({ success: false, message: `Insufficient stock for ${med.name}` });
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

// Verify payment
router.post("/verify", authUser, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) return res.status(400).json({ success: false, message: "Order not found" });

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Invalid payment signature" });

    for (let item of order.medicines) {
      const med = await Medicine.findById(item.medicineId);
      if (med) {
        med.stock -= item.quantity;
        await med.save();
      }
    }

    order.status = "Paid";
    await order.save();

    res.json({ success: true, message: "Payment verified successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get orders for logged-in user
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
// Admin: get all orders (safe version)
// routes/orderRoute.js

router.get("/admin/orders", authAdmin, async (req, res) => {
  try {
    // Fetch all orders, sort by creation date descending
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean(); // plain JS objects, safer

    // Map orders to safely include user and medicine info
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        let user = null;
        try {
          user = await User.findById(order.userId).select("name email").lean();
        } catch (e) {
          console.warn(`User not found for order ${order._id}`);
        }

        const medicines = await Promise.all(
          order.medicines.map(async (item) => {
            let med = null;
            try {
              med = await Medicine.findById(item.medicineId)
                .select("name price")
                .lean();
            } catch (e) {
              console.warn(`Medicine not found for order ${order._id}`);
            }
            return {
              medicineId: med ? med._id : null,
              name: med ? med.name : "Deleted Medicine",
              price: med ? med.price : 0,
              quantity: item.quantity,
            };
          })
        );

        return {
          ...order,
          userId: user || { name: "Deleted User", email: "" },
          medicines,
        };
      })
    );

    res.json({ success: true, data: ordersWithDetails });
  } catch (err) {
    console.error("Admin Fetch Orders Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




export default router;
