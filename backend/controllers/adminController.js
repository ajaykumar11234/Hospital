import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import validator from 'validator'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
// Add Doctor Controller
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const imageFile = req.file;

    // Check for required fields
    if (
      !name || !email || !password || !speciality || !degree ||
      !experience || !about || !fees || !address || !imageFile
    ) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    // Check if doctor already exists
    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.status(409).json({ success: false, message: "Doctor already exists" });
    }

    // Upload image to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(imageFile.path, {
      folder: 'doctors'
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image: cloudinaryResponse.secure_url, // ✅ this is required by your schema
    });

    await newDoctor.save();

    res.status(201).json({ success: true, message: "Doctor added successfully", doctor: newDoctor });

  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//ApI fro admin login



const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email, role: 'admin' }, // Payload
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Optional expiry
      );

      // You can send it as `atoken` to match your middleware
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        atoken: token, // 🔁 Matches what you use in req.headers.atoken
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Credentials',
      });
    }
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
    });
  }
};

// api to get all doctors list fro admin panel

const allDoctors = async (req, res) => {
try{
const doctors = await doctorModel.find({}).select('-password'); // Exclude password field
  if (!doctors || doctors.length === 0) {
    return res.status(404).json({ success: false, message: "No doctors found" });
  }
  res.status(200).json({ success: true, doctors });

}
catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

//ApI to get all appointments list


const appointmentsAdmin= async(req,res)=>{
try{
const appointments=await appointmentModel.find({})

res.json({success:true,appointments})
}catch(error){
console.log(error)
res.json({success:false,message:error.message})
}
}


//API for appointment cancellation
const appointmentCancel=async (req,res)=>{
try{
const {appointmentId} =req.body
const appointmentData =await appointmentModel.findById(appointmentId)

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

//Api to get DashBoard Data
const adminDashboard =async(req,res)=>{
try{
const doctors=await doctorModel.find({})
const users=await userModel.find({})
const appointments=await appointmentModel.find({})


const dashData={
doctors:doctors.length,
appointments:appointments.length,
patients:users.length,
latestAppointments:appointments.reverse().slice(0,5)

}
res.status(200).json({ success: true, dashData });
}
catch(error){
console.log(error)
res.json({success: false,message:error.message})
}

}
export { addDoctor,loginAdmin, allDoctors , appointmentsAdmin, appointmentCancel, adminDashboard};



