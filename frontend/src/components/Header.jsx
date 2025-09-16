import React from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets_frontend/assets';

const features = [
  { icon: assets.stethoscope_icon, label: 'Disease Predictor' },
  { icon: assets.chat_icon, label: 'AI Chatbot' },
  { icon: assets.reminder_icon, label: 'Medical Reminder' },
  { icon: assets.doctor_icon, label: 'Live Doctor Chat' },
   {icon: assets.doctor_icon, label: 'Medical Store' },
];

const Header = () => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-6 md:px-10 lg:px-20 py-16 flex flex-col items-center gap-10 overflow-hidden">
      
      {/* Heading */}
      <motion.div
        className="text-center max-w-2xl z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-snug">
          AI-Powered Healthcare at Your Fingertips
        </h1>

        <p className="text-white/90 text-base md:text-lg mt-4">
          Access personalized healthcare solutions with AI tools, disease prediction, medical reminders, and live doctor chat – all in one platform.
        </p>
      </motion.div>

      {/* Floating Feature Cards */}
      <div className="relative flex flex-wrap justify-center gap-6 z-10">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center gap-2 bg-white rounded-xl px-6 py-4 shadow-lg cursor-pointer"
            whileHover={{ scale: 1.1, boxShadow: '0px 15px 25px rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index, type: 'spring', stiffness: 120 }}
          >
            {/* <img src={feature.icon} alt={feature.label} className="w-12 h-12" /> */}
            <span className="text-gray-800 font-semibold">{feature.label}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.a
        href="#features"
        className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 mt-8 w-fit shadow-md z-10"
        whileHover={{ scale: 1.05 }}
      >
        Explore Features
        <img src={assets.arrow_icon} alt="arrow" className="w-4 h-4" />
      </motion.a>

      {/* Decorative Floating Circles */}
      <motion.div
        className="absolute top-0 right-0 w-72 h-72 bg-purple-500/30 rounded-full -translate-x-20 -translate-y-20 blur-3xl z-0"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-60 h-60 bg-blue-400/30 rounded-full translate-x-20 translate-y-20 blur-3xl z-0"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default Header;
