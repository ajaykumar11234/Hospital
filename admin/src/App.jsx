import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext';

import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import { Route, Routes } from 'react-router-dom';

// Admin pages
import Dashboard from './pages/Admin/Dashboard';
import AddDoctor from './pages/Admin/AddDoctor';
import AllAppointments from './pages/Admin/AllAppointments';
import DoctorsList from './pages/Admin/DoctorsList';
import AddMedicine from './pages/Admin/AddMedicine.jsx';

// Doctor pages
import VideoCall from './pages/Doctor/VideoCall.jsx';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorChatRoom from './pages/Doctor/DoctorChatRoom';
import MedicineList from './pages/Admin/MedicineList.jsx';
import AdminOrders from './pages/Admin/AdminOrders.jsx';


const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} pauseOnHover draggable />

      {aToken || dToken ? (
        <div>
          <Navbar />
          <div className="flex">
            {/* Pass role to Sidebar */}
            <Sidebar role={aToken ? 'admin' : 'doctor'} />
            <div className="flex-1 p-4">
              <Routes>
                {aToken && (
                  <>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/admin-dashboard" element={<Dashboard />} />
                    <Route path="/all-appointments" element={<AllAppointments />} />
                    <Route path="/add-doctor" element={<AddDoctor />} />
                    <Route path="/doctor-list" element={<DoctorsList />} />
                    <Route path="/add-medicine" element={<AddMedicine />} />
                    <Route path="/medicine" element={<MedicineList />} />
                    <Route path="/orders" element={<AdminOrders />} />

                  </>
                )}

                {dToken && (
                  <>
                    <Route path="/" element={<DoctorDashboard />} />
                    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                    <Route path="/doctor-appointments" element={<DoctorAppointment />} />
                    <Route path="/doctor-profile" element={<DoctorProfile />} />
                    <Route path="/doctor/chat/:appointmentId" element={<DoctorChatRoom />} />
                    <Route path="/video/:appointmentId" element={<VideoCall />} />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </>
  );
};

export default App;
