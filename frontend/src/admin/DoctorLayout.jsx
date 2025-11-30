import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorChatRoom from './pages/Doctor/DoctorChatRoom';
import DoctorVideoCall from './pages/Doctor/DoctorVideoCall';
import ActivePatients from './pages/Doctor/ActivePatients';
import { DoctorContext } from './context/DoctorContext';
import DoctorContextProvider from './context/DoctorContext';
import AppContext from './context/AppContext';

const DoctorLayout = () => {
  return (
    <AppContext>
      <DoctorContextProvider>
        <DoctorRoutes />
      </DoctorContextProvider>
    </AppContext>
  );
};

const DoctorRoutes = () => {
  const { dToken } = useContext(DoctorContext);

  // Check for dToken in both context and localStorage
  const hasDoctorToken = dToken || localStorage.getItem('dToken');

  if (!hasDoctorToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<DoctorDashboard />} />
            <Route path="/dashboard" element={<DoctorDashboard />} />
            <Route path="/appointments" element={<DoctorAppointment />} />
            <Route path="/profile" element={<DoctorProfile />} />
            <Route path="/chat/:appointmentId" element={<DoctorChatRoom />} />
            <Route path="/video/:appointmentId" element={<DoctorVideoCall />} />
            <Route path="/active-patients" element={<ActivePatients />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
