import React from 'react';
import { assets } from '../assets/assets_frontend/assets';
import { Target, Eye, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          About Us
        </h1>
        <p className="text-gray-600 mt-4 text-lg md:text-xl">
          Discover our <span className="text-blue-600 font-semibold">mission</span>,{' '}
          <span className="text-blue-600 font-semibold">vision</span>, and meet the team behind
          this innovative platform.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center gap-10 bg-white p-8 md:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={assets.about_image}
            alt="About"
            className="rounded-2xl max-w-md md:max-w-full w-full h-auto object-cover shadow-md transform hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 space-y-6">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            We are committed to delivering{' '}
            <span className="text-blue-600 font-semibold">accessible</span> and{' '}
            <span className="text-blue-600 font-semibold">personalized healthcare solutions</span>{' '}
            using cutting-edge technology. Our platform bridges the gap between patients and
            healthcare professionals, providing a{' '}
            <span className="text-blue-600 font-semibold">seamless online experience</span> for
            consultations, appointments, and health tracking.
          </p>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Featuring <span className="text-blue-600 font-semibold">AI-powered tools</span>,{' '}
            <span className="text-blue-600 font-semibold">live doctor interactions</span>, and smart
            health management systems, we ensure patients receive{' '}
            <span className="text-blue-600 font-semibold">timely</span> and{' '}
            <span className="text-blue-600 font-semibold">efficient</span> medical care.
          </p>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Built by a passionate team of developers and healthcare experts, we strive to create a{' '}
            <span className="text-blue-600 font-semibold">healthier tomorrow</span> through
            innovation and technology.
          </p>
        </div>
      </div>

      {/* Mission, Vision & Values Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <Target className="mx-auto h-10 w-10 text-blue-600 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h3>
          <p className="text-gray-600 text-base">
            To provide accessible and personalized healthcare solutions using advanced technology.
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <Eye className="mx-auto h-10 w-10 text-green-600 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Our Vision</h3>
          <p className="text-gray-600 text-base">
            To create a seamless digital healthcare platform connecting patients with professionals.
          </p>
        </div>

        <div className="bg-pink-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <Users className="mx-auto h-10 w-10 text-pink-600 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Our Values</h3>
          <p className="text-gray-600 text-base">
            Innovation, empathy, accessibility, and delivering timely, efficient healthcare solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
