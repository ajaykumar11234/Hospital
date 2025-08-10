import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from 'razorpay'
// API to register
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

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d' // Token expires in 1 day
    });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API for User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

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

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Validate required fields
    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    // Check if user exists
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Parse address safely
    let parsedAddress = {};
    if (address) {
      try {
        parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid address format" });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    };

    // Handle image upload if present
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          folder: 'user-profiles',
          resource_type: "image",
        });
        updateData.image = imageUpload.secure_url;
      } catch (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }
    }

    // Update user data
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Profile Updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    if (!userId || !docId || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const docData = await doctorModel.findById(docId).select('-password');
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.status(400).json({ success: false, message: "Doctor Not Available" });
    }

    let slots_booked = docData.slots_booked || {};

    // Check for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.status(400).json({ success: false, message: "Slot not Available" });
      }
      slots_booked[slotDate].push(slotTime);
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const docDataForAppointment = { ...docData.toObject() };
    delete docDataForAppointment.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docDataForAppointment,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: new Date()
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save new slots data in docdata
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked", appointment: newAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get my appointments
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const appointments = await appointmentModel.find({ userId });
    
    res.json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
      error: error.message
    });
  }
};



//API to cancel appointmnet

const cancelAppointment =async (req,res)=>{
try{
const {userId,appointmentId} =req.body
const appointmentData =await appointmentModel.findById(appointmentId)

//verif appointment user

if(appointmentData.userId!==userId){
return res.json({success:false, message:"Unauthorized Action"})
}

await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})


//releasing Doctors slot..
const {docId,slotDate,slotTime}=appointmentData

const doctorData=await doctorModel.findById(docId)
let slots_booked=doctorData.slots_booked

slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)

await doctorModel.findByIdAndUpdate(docId,{slots_booked})
res.json({success:true,message:"Appointment Cancelled"})
}
catch(error){
console.log(error)
res.json({success: false,message:error.message})
}
}


const razorpayInstance =new razorpay({
key_id:process.env.RAZORPAY_KEY_ID,
key_secret:process.env.RAZORPAY_KEY_SECRET
})
// API to make payment of appointment using razorpay


const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled or Not Found" });
    }

    // creating options for razor payment
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,  // Added missing comma here
      receipt: appointmentId.toString()  // Ensure receipt is a string
    };

    // creation of an order..
    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to verify payment of razorpay..

const verifyRazorpay = async (req,res)=>{
try{

const {razorpay_order_id} =req.body
const orderInfo= await razorpayInstance.orders.fetch(razorpay_order_id)

// console.log(orderInfo)
if(orderInfo.status==='paid'){
await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})

res.json({success:true,message:"Payment successful"})
}
else{
res.json({success:false,message:"Payment failed"})
}


}
catch(error){
console.log(error);
    res.json({ success: false, message: error.message });
}
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment,listAppointment, cancelAppointment,paymentRazorpay,verifyRazorpay };