import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medicines: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending" }, // ✅ Only relevant statuses
    razorpayOrderId: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
