import React from 'react'
import { assets } from '../assets/assets_frontend/assets';
import header_img from '../assets/assets_frontend/header_img.png';

const Header = () => {
  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-1 bg-primary rounded-lg px-6 md:px-10 lg:px-20 py-10">
      
      {/* Left Content */}
      <div className="flex flex-col gap-6 max-w-xl">
        <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-snug">
          Book Appointments <br /> With Trusted Doctors
        </p>

        <div className="flex items-start gap-4">
          <img src={assets.group_profiles} alt="group profiles" className="w-12 h-12" />
          <p className="text-sm md:text-base text-white">
            Simply browse through our extensive list of trusted doctors, <br />
            schedule your appointments.
          </p>
        </div>

        <a
          href="#speciality"
          className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-4 py-2 rounded-md hover:bg-gray-100 w-fit"
        >
          Book Appointment
          <img src={assets.arrow_icon} alt="arrow" className="w-4 h-4" />
        </a>
      </div>

      {/* Right Image */}
      <div className="flex justify-center">
        <img src={header_img} alt="header" className="w-full max-w-md md:max-w-lg lg:max-w-xl" />
      </div>
    </div>
  );
};


export default Header
