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
import DoctorsList from './pages/Admin/Doctorslist';

// Doctor pages
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorChatRoom from './pages/Doctor/DoctorChatRoom';

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
                  </>
                )}

                {dToken && (
                  <>
                    <Route path="/" element={<DoctorDashboard />} />
                    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                    <Route path="/doctor-appointments" element={<DoctorAppointment />} />
                    <Route path="/doctor-profile" element={<DoctorProfile />} />
                    <Route path="/doctor/chat/:appointmentId" element={<DoctorChatRoom />} />
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
