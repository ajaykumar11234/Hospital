import express from "express";
import Medicine from "../models/medicineModel.js";
import { authAdmin } from "../middlewares/authAdmin.js";
import { authUser } from "../middlewares/authUser.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Multer setup (temporary storage in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------------
// Admin: Add new medicine
// ---------------------
router.post("/add", authAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, brand, description, category, price, stock } = req.body;
    let imageUrl = "";

    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "medicines" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploaded.secure_url;
    }

    const med = new Medicine({
      name,
      brand,
      description,
      category,
      price,
      stock,
      imageUrl,
    });

    await med.save();
    res.json({ success: true, data: med, message: "Medicine added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------
// Admin: Get all medicines
// ---------------------
router.get("/all", authAdmin, async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json({ success: true, data: medicines });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/allStock", authUser, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ available if needed

    const medicines = await Medicine.find();
    res.json({ success: true, data: medicines });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ---------------------
// Admin: Update medicine
// ---------------------
router.put("/update/:id", authAdmin, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "medicines" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      updateData.imageUrl = uploaded.secure_url;
    }

    const med = await Medicine.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: med, message: "Medicine updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------
// Admin: Delete medicine
// ---------------------
router.delete("/delete/:id", authAdmin, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Medicine deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
