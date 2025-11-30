import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets_frontend/assets';

const featuresData = [
  {
    name: 'Disease Predictor',
    description: 'Predict potential diseases based on your symptoms.',
    icon: assets.stesthoscope,
    link: '/check-disease',
  },
  {
    name: 'AI Chatbot',
    description: 'Get instant AI-powered health advice and guidance.',
    icon: assets.chatbot,
    link: '/chatbot',
  },
  {
    name: 'Medical Reminder',
    description: 'Never miss your medicines and appointments.',
    icon: assets.reminder,
    link: '/reminder',
  },
  {
    name: 'Book Appointment',
    description: 'Book Appointment the doctors.',
    icon: assets.booking,
    link: '/doctors',
  },
  {
    name: 'Live Doctor Chat',
    description: 'Consult with real doctors in real-time.',
    icon: assets.chat,
    link: '/live-chat',
  },
  {
    name: 'Medical Store',
    description: 'Order your Medicine Online',
    icon: assets.medicalStore,
    link: '/buy-medicine',
  },
  {
    name: 'Health Records',
    description: 'Store and manage your medical documents securely.',
    icon: assets.stesthoscope,
    link: '/my-health-records',
  },
];

const FeaturesMenu = () => {
  return (
    <div id="features" className="px-6 md:px-10 lg:px-20 py-16 bg-gray-50 text-center">
      {/* Section Heading */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
        Explore Our Features
      </h1>
      <p className="text-sm md:text-base text-gray-600 mb-10 max-w-2xl mx-auto">
        Discover all the tools available on our platform to manage your health efficiently.
      </p>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
        {featuresData.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300"
          >
            <img src={feature.icon} alt={feature.name} className="w-14 h-14" />
            <h3 className="text-lg font-semibold text-gray-800">{feature.name}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturesMenu;
