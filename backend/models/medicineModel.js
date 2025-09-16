import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  description: String,
  category: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  imageUrl: String,
});

export default mongoose.model("Medicine", medicineSchema);
