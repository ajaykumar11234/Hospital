import React from 'react';
import { assets } from '../assets/assets_frontend/assets';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">About Us</h1>
        <p className="text-gray-600 mt-2">
          Learn more about our <span className="text-blue-600 font-semibold">mission</span>,{' '}
          <span className="text-blue-600 font-semibold">vision</span>, and the team behind this platform.
        </p>
      </div>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 rounded-xl shadow-lg">
        {/* Image Section */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={assets.about_image}
            alt="About"
            className="rounded-xl max-w-sm w-full h-auto object-cover shadow-md"
          />
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 space-y-4">
          <p className="text-gray-700 text-base leading-relaxed">
            We are dedicated to providing{' '}
            <span className="text-blue-600 font-semibold">accessible</span> and{' '}
            <span className="text-blue-600 font-semibold">personalized healthcare solutions</span> through
            advanced technology. Our goal is to bridge the gap between patients and healthcare
            professionals by offering a{' '}
            <span className="text-blue-600 font-semibold">seamless online platform</span> for appointments,
            consultations, and health tracking.
          </p>

          <p className="text-gray-700 text-base leading-relaxed">
            Our platform features <span className="text-blue-600 font-semibold">AI-powered tools</span>,{' '}
            <span className="text-blue-600 font-semibold">real-time doctor interactions</span>, and smart
            health management systems to ensure patients receive{' '}
            <span className="text-blue-600 font-semibold">timely</span> and{' '}
            <span className="text-blue-600 font-semibold">efficient</span> medical attention.
          </p>

          <p className="text-gray-700 text-base leading-relaxed">
            Built by a passionate team of developers and healthcare experts, we believe in using
            technology to create a <span className="text-blue-600 font-semibold">healthier tomorrow</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
