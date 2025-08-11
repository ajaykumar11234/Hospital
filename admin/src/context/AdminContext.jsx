import axios from 'axios';
import { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const storedToken = localStorage.getItem('aToken') || '';
  const [aToken, setAToken] = useState(storedToken);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData,setDashData]=useState({})

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message || 'Failed to fetch doctors');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Server Error');
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        { docId },
        { headers: { atoken: aToken } }
      );

      if (data.success) {
        toast.success(data.message || 'Doctor availability changed successfully');
        // Option 1: Refetch (simpler)
        getAllDoctors();

        // Option 2: Update locally (faster)
        // setDoctors(prev =>
        //   prev.map(doc =>
        //     doc._id === docId ? { ...doc, available: !doc.available } : doc
        //   )
        // );
      } else {
        toast.error(data.message || 'Failed to change availability');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Server Error');
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
        headers: { atoken: aToken },
      });

      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Server Error');
    }
  };


const cancelAppointment = async (appointmentId) => {
  try {
    const { data } = await axios.post(
      `${backendUrl}/api/admin/cancel-appointment`,
      { appointmentId },
      { headers: { atoken: aToken } }
    );

    if (data.success) {
      toast.success("Appointment cancelled");
      await getdashData(); // Refresh data so UI updates
    } else {
      toast.error(data.message || "Failed to cancel appointment");
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Server Error");
  }
};



const getdashData = async () => {
  try {
    const { data } = await axios.get(
      `${backendUrl}/api/admin/dashboard`,
      { headers: { atoken: aToken } } // match backend header key
    );

    if (data.success) {
      setDashData(data.dashData);
      console.log(data.dashData)
    } else {
      toast.error(data.message || 'Failed to fetch dashboard data');
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || 'Server Error');
    return false;
  }
};


  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,getdashData
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContextProvider;
