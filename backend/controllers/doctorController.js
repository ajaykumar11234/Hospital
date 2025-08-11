import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js";

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        // Validate input
        if (!docId) {
            return res.status(400).json({ 
                success: false, 
                message: "Doctor ID is required" 
            });
        }

        const docData = await doctorModel.findById(docId);
        
        // Check if doctor exists
        if (!docData) {
            return res.status(404).json({ 
                success: false, 
                message: "Doctor not found" 
            });
        }

        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            docId, 
            { available: !docData.available },
            { new: true } // Return the updated document
        ).select('-password -email'); // Exclude sensitive fields

        res.status(200).json({ 
            success: true, 
            message: "Doctor availability changed successfully",
            doctor: updatedDoctor 
        });
    } catch (error) {
        console.error("Error in changeAvailability:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error",
            error: error.message 
        });
    }
}

const doctorList = async (req, res) => { // Added req, res parameters which were missing
    try {
        const doctors = await doctorModel.find({})
            .select(['-password', '-email']); // Exclude sensitive fields
        
        res.status(200).json({ 
            success: true, 
            doctors 
        });
    } catch (error) {
        console.error("Error in doctorList:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error",
            error: error.message 
        });
    }
}

// Api for doctor Login
const loginDoctor= async(req,res)=>{
try{
const {email,password}=req.body
const doctor=await doctorModel.findOne({email})
if(!doctor){
return res.json({success:false,message:"Invalid credentials"})}

const isMatch=await bcrypt.compare(password,doctor.password)

if(isMatch){
const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)
res.json({success:true,token})
}
else{
res.json({success:false,message:"Invalid credentials"})}
}
catch(error){
console.log(error)
res.json({success:false,message:error.message})
}
}

//api to doctor appointments

const appointmentsDoctor= async(req,res)=>{
try{
const {docId}=req.body
const appointments=await appointmentModel.find({docId})
res.json({success:true,appointments})
}
catch(error){
console.log(error)
res.json({success:false,message:error.message})

}
}

// API to mark appointment as completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    // Find the appointment
    const appointmentData = await appointmentModel.findById(appointmentId);

    // Check if appointment exists and belongs to the doctor
    if (appointmentData && String(appointmentData.docId) === String(docId)) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }

  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel= async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    // Find the appointment
    const appointmentData = await appointmentModel.findById(appointmentId);

    // Check if appointment exists and belongs to the doctor
    if (appointmentData && String(appointmentData.docId) === String(docId)) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "CancellationFailed" });
    }

  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Api to get dashbaord data

const doctorDashboard= async(req,res)=>{
try{
const {docId}=req.body
const appointments=await appointmentModel.find({docId})

let earnings=0

appointments.map((item)=>{
if(item.isCompleted || item.payment){
earnings+=item.amount;
}})
let patients=[]

appointments.map((item)=>{
if(!patients.includes(item.userId)){
patients.push(item.userId)}
})
const dashData={
earnings,
appointments:appointments.length,
patients:patients.length,
latestAppointments:appointments.reverse().slice(0,5),
}
res.json({success:true,dashData})
}
catch(error){
res.json({success:false,message:error.message})}
}

const doctorProfile =async (req,res)=>
{
try{
const {docId}=req.body
const profileData= await doctorModel.findById(docId).select('-password')

res.json({success:true,profileData})
}
catch(error){
res.json({success:false,message:error.message})}

}


// Update 

const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      docId,
      { fees, address, available },
      { new: true } // ✅ Return updated document
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      profileData: updatedDoctor, // ✅ Send updated profile back
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { changeAvailability, doctorList,loginDoctor, appointmentsDoctor,appointmentCancel,appointmentComplete,doctorDashboard,
doctorProfile,
updateDoctorProfile
};