import React from 'react';
import { assets } from '../assets/assets_frontend/assets';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          CONTACT <span className="text-blue-600">US</span>
        </h1>
        <p className="mt-2 text-gray-600">We are here to assist you 24/7</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <img
            src={assets.contact_image}
            alt="Contact"
            className="rounded-lg shadow-xl w-full max-w-md mx-auto md:mx-0"
          />
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 space-y-8 text-gray-700">
          {/* Hospital Info */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              OUR HOSPITAL: <span className="text-blue-600">AJ HOSPITALS</span>
            </h2>
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" /> Uppal X Road, Opposite to Metro Station
            </p>
            <p className="flex items-center gap-2">
              <FaPhoneAlt className="text-blue-600" /> 
              <a href="tel:+918919xxxxxx" className="hover:underline">
                8919xxxxxx
              </a>
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-blue-600" /> 
              <a href="mailto:ajaykumarmekala42@gmail.com" className="hover:underline">
                ajaykumarmekala42@gmail.com
              </a>
            </p>
          </div>

          {/* Careers Info */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">CAREERS AT OUR HOSPITAL</h2>
            <p className="text-gray-600">Learn more about our team and job openings.</p>
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition">
              Explore Jobs
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 mt-4">
            <a href="#" className="text-blue-600 hover:text-blue-800 text-xl">
              <FaFacebookF />
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-xl">
              <FaTwitter />
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-xl">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
