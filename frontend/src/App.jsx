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
const App = () => {
  return (
    <>
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
      <div className="relative">
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
          <div className="mx-4 sm:mx-[-2%]">
            <Navbar />
          </div>
        </div>

        {/* Scrollable content with top padding to avoid overlap */}
        <div className="mt-10 pt-[84px] mx-4 sm:mx-[5%]">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/doctors/:speciality' element={<Doctors />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/my-profile' element={<MyProfile />} />
            <Route path='/my-appointments' element={<MyAppointments />} />
            <Route path='/appointment/:docId' element={<Appointment />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/check-disease' element={<SymptomChecker/>}/>
            <Route path="/chatbot" element={<Chatbot/>}/>
            <Route path="/chat/:appointmentId" element={<PatientChatRoom />} /> 
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;