import React from 'react';
import { assets } from '../assets/assets_frontend/assets';

const Contact = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Heading */}
      <div className="text-center mb-10">
        <p className="text-3xl font-bold text-gray-800">
          CONTACT <span className="text-blue-600">US</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <img
            src={assets.contact_image}
            alt="Contact"
            className="rounded-lg shadow-lg w-full max-w-md mx-auto md:mx-0"
          />
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 space-y-6 text-gray-700">
          {/* Hospital Info */}
          <div>
            <p className="text-lg font-semibold text-gray-900">OUR HOSPITAL : <span className="text-blue-600">AJ HOSPITALS</span></p>
            <p className="mt-1">Uppal X Road, Opposite to Metro Station</p>
            <p className="mt-2">
              <span className="font-medium">Tel:</span> 8919xxxxxx <br />
              <span className="font-medium">Email:</span>{' '}
              <span className="text-blue-600">ajaykumarmekala42@gmail.com</span>
            </p>
          </div>

          {/* Careers Info */}
          <div>
            <p className="text-lg font-semibold text-gray-900">CAREERS AT OUR HOSPITALS</p>
            <p className="text-sm text-gray-600 mb-3">Learn more about our team and job openings.</p>
            <button className="px-5 py-2 border border-gray-700 text-gray-800 hover:bg-blue-600 hover:text-white transition rounded-md">
              Explore Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
