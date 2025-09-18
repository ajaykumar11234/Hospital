import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const storedToken = localStorage.getItem("dToken") || "";
  const [dToken, setDToken] = useState(storedToken);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);
  const [activePatients, setActivePatients] = useState([]); // ✅ Active patients

  // ----------- Profile -----------
  const updateProfile = async (updatedData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        updatedData,
        { headers: { dtoken: dToken } }
      );
      if (data.success) {
        toast.success("Profile updated successfully");
        setProfileData(data.profileData || updatedData);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dtoken: dToken },
      });
      if (data.success) setProfileData(data.profileData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ----------- Appointments -----------
  const getAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { dtoken: dToken },
      });
      if (data.success) setAppointments(data.appointments);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/complete-appointment`,
        { appointmentId },
        { headers: { dtoken: dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else toast.error(data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId },
        { headers: { dtoken: dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else toast.error(data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ----------- Dashboard -----------
  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: { dtoken: dToken },
      });
      if (data.success) setDashData(data.dashData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getActivePatients = async () => {
  try {
    const { data } = await axios.get(`${backendUrl}/api/doctor/active-patients`, {
      headers: { dtoken: dToken }, // ✅ must match your authDoctor middleware
    });

    if (data.success) setActivePatients(data.patients);
    else toast.error(data.message || "Failed to fetch active patients");
  } catch (error) {
    console.error("Get Active Patients Error:", error);
    toast.error(error.response?.data?.message || error.message);
  }
};


  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    updateProfile,
    activePatients,
    getActivePatients,
  };

  return <DoctorContext.Provider value={value}>{props.children}</DoctorContext.Provider>;
};

export default DoctorContextProvider;
