import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Navbar from './components/Navbar.jsx';
import Doctors from './pages/Doctors.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import MyProfile from './pages/MyProfile.jsx';
import MyAppointments from './pages/MyAppointments.jsx';
import Appointment from './pages/Appointment.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SymptomChecker from './pages/SymptomChecker.jsx';
import Chatbot from './pages/Chatbot.jsx';
import ChatRoom from './components/PatientChatRoom.jsx';
import PatientChatRoom from './components/PatientChatRoom.jsx';
import MedicineReminder from './pages/MedicineReminder.jsx';
import PatientVideoCall from './pages/PatientVideoCall.jsx';
import MyDoctors from './pages/MyDoctors.jsx';
import BuyMedicine from "./pages/BuyMedicine";
import MyOrders from './pages/MyOrders.jsx';
import MyHealthRecords from './pages/MyHealthRecords.jsx';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import DoctorLayout from './admin/DoctorLayout.jsx';

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public routes - no navbar */}
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Admin routes - has its own navbar in AdminLayout */}
        <Route path='/admin/*' element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        } />

        {/* Doctor routes - has its own navbar in DoctorLayout */}
        <Route path='/doctor/*' element={
          <ProtectedRoute roles={["doctor"]}>
            <DoctorLayout />
          </ProtectedRoute>
        } />

        {/* User routes - with user navbar */}
        <Route path='/home' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <Home />
            </div>
          </div>
        } />
        <Route path='/doctors' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <Doctors />
            </div>
          </div>
        } />
        <Route path='/doctors/:speciality' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <Doctors />
            </div>
          </div>
        } />
        <Route path='/about' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <About />
            </div>
          </div>
        } />
        <Route path='/contact' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <Contact />
            </div>
          </div>
        } />
        <Route path='/my-profile' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <MyProfile />
            </div>
          </div>
        } />
        <Route path='/my-appointments' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <MyAppointments />
            </div>
          </div>
        } />
        <Route path='/appointment/:docId' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <Appointment />
            </div>
          </div>
        } />
        <Route path='/check-disease' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <SymptomChecker />
            </div>
          </div>
        } />
        <Route path='/chatbot' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <Chatbot />
            </div>
          </div>
        } />
        <Route path='/chat/:appointmentId' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <PatientChatRoom />
            </div>
          </div>
        } />
        <Route path='/reminder' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <MedicineReminder />
            </div>
          </div>
        } />
        <Route path='/video/:appointmentId' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <PatientVideoCall />
            </div>
          </div>
        } />
        <Route path='/live-chat' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <MyDoctors />
            </div>
          </div>
        } />
        <Route path='/buy-medicine' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <BuyMedicine />
            </div>
          </div>
        } />
        <Route path='/my-orders' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <MyOrders />
            </div>
          </div>
        } />
        <Route path='/my-health-records' element={
          <div className="relative">
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
              <div className="mx-4 sm:mx-[-2%]">
                <Navbar />
              </div>
            </div>
            <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
              <MyHealthRecords />
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
};

export default App;