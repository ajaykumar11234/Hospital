import React, { use } from 'react';
import appointment_img from '../assets/assets_frontend/appointment_img.png';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
const navigate=useNavigate();
  return (
    <div className="bg-primary/5 py-10 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Text Section */}
      <div className="max-w-xl text-center md:text-left">
        <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Book Appointments
        </p>
        <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          With 100+ Trusted Doctors
        </p>
        <button onClick={()=>{navigate('/login')}} className="bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-primary/90 transition">
          Create Account
        </button>
      </div>

      {/* Image Section */}
      <div className="w-full md:w-[40%]">
        <img
          src={appointment_img}
          alt="Appointment"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default Banner;
