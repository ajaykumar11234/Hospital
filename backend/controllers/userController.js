import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
import sendEmail from "../utils/sendEmail.js";
// ------------------------ REGISTER USER ------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid Email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------ LOGIN USER ------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------ GET PROFILE ------------------------
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ get ID from middleware
    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ------------------------ UPDATE PROFILE ------------------------
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) return res.status(400).json({ success: false, message: "Required fields are missing" });

    const existingUser = await userModel.findById(userId);
    if (!existingUser) return res.status(404).json({ success: false, message: "User not found" });

    let parsedAddress = {};
    if (address) {
      try {
        parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid address format" });
      }
    }

    const updateData = { name, phone, address: parsedAddress, dob, gender };

    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          folder: "user-profiles",
          resource_type: "image",
        });
        updateData.image = imageUpload.secure_url;
      } catch (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    res.json({ success: true, message: "Profile Updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------ BOOK APPOINTMENT ------------------------

const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { docId, slotDate, slotTime, slotDateTime } = req.body;

    if (!userId || !docId || !slotDate || !slotTime || !slotDateTime)
      return res.status(400).json({ success: false, message: "Required fields missing" });

    const slotDateObj = new Date(slotDateTime);
    if (isNaN(slotDateObj.getTime()))
      return res.status(400).json({ success: false, message: "Invalid slot date/time" });

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!docData.available) return res.status(400).json({ success: false, message: "Doctor not available" });

    let slots_booked = docData.slots_booked || {};
    if (slots_booked[slotDate]?.includes(slotTime))
      return res.status(400).json({ success: false, message: "Slot not available" });

    // Add slot
    if (slots_booked[slotDate]) slots_booked[slotDate].push(slotTime);
    else slots_booked[slotDate] = [slotTime];

    const userData = await userModel.findById(userId).select("-password");

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      slotDateTime: slotDateObj,
      userData: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
      },
      docData: {
        name: docData.name,
        speciality: docData.speciality,
        fees: docData.fees,
        image: docData.image, // ✅ Include doctor image
        degree: docData.degree || "",
      },
      amount: docData.fees,
      payment: false,
      cancelled: false,
      isCompleted: false,
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Send email
    await sendEmail(
  userData.email,
  "Appointment Confirmed ✅",
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Appointment Confirmed</h2>
      <p>Hello <strong>${userData.name}</strong>,</p>
      <p>Your appointment with <strong>${docData.name}</strong> on 
      <strong>${slotDate}</strong> at <strong>${slotTime}</strong> is confirmed.</p>
      <p><strong>Appointment ID:</strong> ${newAppointment._id}</p>
      <br/>
      <p style="font-size: 0.9em; color: #555;">Thank you for choosing our Virtual Health Assistant!.</p>
    </div>
  `
);

    res.json({ success: true, message: "Appointment booked successfully!", appointment: newAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// // ------------------------ LIST APPOINTMENTS ------------------------
const listAppointment = async (req, res) => {
  try {
    const userId = req.user.id; 
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, message: "Appointments retrieved successfully", data: appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve appointments", error: error.message });
  }
};

// ------------------------ CANCEL APPOINTMENT ------------------------
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (appointmentData.userId.toString() !== userId) return res.status(403).json({ success: false, message: "Unauthorized Action" });

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------ RAZORPAY PAYMENT ------------------------
const razorpayInstance = new razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled or Not Found" });
    }

    const options = { amount: appointmentData.amount * 100, currency: process.env.CURRENCY, receipt: appointmentId.toString() };
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      res.json({ success: true, message: "Payment successful" });
    } else {
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ------------------------ EXPORT ------------------------
export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay };
