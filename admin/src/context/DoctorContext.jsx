import {createContext} from 'react';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';

 export const DoctorContext= createContext()
 const DoctorContextProvider=(props)=>{

 const backendUrl=import.meta.env.VITE_BACKEND_URL
   const storedToken = localStorage.getItem('dToken') || '';
   const [dToken, setDToken] = useState(storedToken);
   const [appointments,setAppointments]=useState([])
   const [dashData,setDashData]=useState(false)
   const [profileData,setProfileData]=useState(false)

const updateProfile = async (updatedData) => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/doctor/update-profile",
      updatedData,
      { headers: { dToken } }
    );

    if (data.success) {
      toast.success("Profile updated successfully");
      setProfileData(data.profileData || updatedData);
    } else {
      toast.error(data.message || "Failed to update profile");
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    toast.error(error.response?.data?.message || error.message);
  }
};

const getAppointments=async ()=>{
try{
const {data}=await axios.get(backendUrl+"/api/doctor/appointments", {headers:{dToken}})

if(data.success){
setAppointments(data.appointments.reverse())
console.log(data.appointments.reverse())
}
else{
toast.error(data.message)
}
}
catch(error){
console.log(error);
toast.error(error.message)
}
}


const completeAppointment = async (appointmentId) => {
  try {
    const { data } = await axios.post(
      `${backendUrl}/api/doctor/complete-appointment`,
      { appointmentId },
      {
        headers: {
          dtoken: dToken, // pass your doctor token here
        },
      }
    );

    if (data.success) {
      toast.success(data.message);
      getAppointments();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Complete Appointment Error:", error);
    toast.error(error.response?.data?.message || error.message);
  }
};


const cancelAppointment = async (appointmentId) => {
  try {
    const { data } = await axios.post(
      `${backendUrl}/api/doctor/cancel-appointment`,
      { appointmentId },
      {
        headers: {
          dtoken: dToken, // send doctor token
        },
      }
    );

    if (data.success) {
      toast.success(data.message);
      getAppointments();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    toast.error(error.response?.data?.message || error.message);
  }
};

const getDashData = async () => {
  try {
    const { data } = await axios.get(
      backendUrl + "/api/doctor/dashboard",
      { headers: { dToken } }
    );

    if (data.success) {
      setDashData(data.dashData);
      console.log(data.dashData)
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Get Dashboard Data Error:", error);
    toast.error(error.response?.data?.message || error.message);
  }
};


const getProfileData =async(req,res)=>{
try{
const {data}=await axios.get(backendUrl+"/api/doctor/profile",{headers:{dToken}})
if(data.success){
setProfileData(data.profileData)
console.log(data.profileData)
}
else{
toast.error(data.message);
}
}
catch(error){
console.log(error)
toast.error(error.message)
}
}

 const value={
 dToken,setDToken,backendUrl,setAppointments,getAppointments,appointments,cancelAppointment,completeAppointment,dashData,setDashData,getDashData,profileData,setProfileData,getProfileData,updateProfile
 }
 
 return (
<DoctorContext.Provider value={value}>
{props.children}
</DoctorContext.Provider>
 )

 }
export default DoctorContextProvider