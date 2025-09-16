import axios from 'axios';
import { createContext, useState, useMemo } from 'react';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const storedToken = localStorage.getItem('aToken') || '';
  const [aToken, setAToken] = useState(storedToken);

  // Doctors
  const [doctors, setDoctors] = useState([]);
  // Appointments
  const [appointments, setAppointments] = useState([]);
  // Dashboard
  const [dashData, setDashData] = useState({});
  // Medicines
  const [medicines, setMedicines] = useState([]);
  const [medLoading, setMedLoading] = useState(false);
  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ---------------- Helpers ----------------
  const handleError = (error) => {
    toast.error(error?.response?.data?.message || error.message || 'Server Error');
  };

  const setToken = (token) => {
    localStorage.setItem('aToken', token);
    setAToken(token);
  };

  // ---------------- Doctors ----------------
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
        headers: { atoken: aToken },
      });
      if (data.success) setDoctors(data.doctors);
      else toast.error(data.message);
    } catch (error) {
      handleError(error);
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
        setDoctors(prev => prev.map(doc =>
          doc._id === docId ? { ...doc, available: !doc.available } : doc
        ));
      } else toast.error(data.message || 'Failed to change availability');
    } catch (error) {
      handleError(error);
    }
  };

  // ---------------- Appointments ----------------
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
        headers: { atoken: aToken },
      });
      if (data.success) setAppointments(data.appointments);
      else toast.error(data.message);
    } catch (error) {
      handleError(error);
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
        toast.success('Appointment cancelled');
        await getdashData(); // Refresh dashboard
      } else toast.error(data.message || 'Failed to cancel appointment');
    } catch (error) {
      handleError(error);
    }
  };

  // ---------------- Dashboard ----------------
  const getdashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: { atoken: aToken },
      });
      if (data.success) setDashData(data.dashData);
      else toast.error(data.message || 'Failed to fetch dashboard data');
    } catch (error) {
      handleError(error);
    }
  };

  // ---------------- Medicines ----------------
  const getAllMedicines = async () => {
    setMedLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/medicines/all`, {
        headers: { atoken: aToken },
      });
      setMedicines(data.data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setMedLoading(false);
    }
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await axios.delete(`${backendUrl}/api/medicines/delete/${id}`, {
        headers: { atoken: aToken },
      });
      setMedicines(prev => prev.filter(med => med._id !== id));
      toast.success('Medicine deleted successfully');
    } catch (error) {
      handleError(error);
    }
  };

  const updateMedicine = async (id, editData, imageFile) => {
    try {
      const formData = new FormData();
      Object.keys(editData).forEach(key => formData.append(key, editData[key]));
      if (imageFile) formData.append('image', imageFile);

      const { data } = await axios.put(`${backendUrl}/api/medicines/update/${id}`, formData, {
        headers: { atoken: aToken },
      });

      setMedicines(prev =>
        prev.map(med => (med._id === id ? data.data : med))
      );
      toast.success(data.message || 'Medicine updated successfully');
    } catch (error) {
      handleError(error);
    }
  };

  // ---------------- Orders ----------------
  const getAllOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/orders/admin/orders`, {
        headers: { atoken: aToken },
      });
      if (data.success) setOrders(data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // ---------------- Memoized Value ----------------
  const value = useMemo(() => ({
    aToken,
    setToken,
    backendUrl,

    // Doctors
    doctors,
    getAllDoctors,
    changeAvailability,

    // Appointments
    appointments,
    getAllAppointments,
    cancelAppointment,

    // Dashboard
    dashData,
    getdashData,

    // Medicines
    medicines,
    medLoading,
    getAllMedicines,
    deleteMedicine,
    updateMedicine,

    // Orders
    orders,
    ordersLoading,
    getAllOrders
  }), [
    aToken, doctors, appointments, dashData, medicines, medLoading, orders, ordersLoading
  ]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContextProvider;
