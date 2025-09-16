import React from 'react';
import { assets } from '../assets/assets_frontend/assets';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="bg-primary/5 text-gray-800 px-6 md:px-20 py-10 mt-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gray-300 pb-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {/* <img src={assets.logo} alt="Logo" className="w-10 h-10 object-contain" /> */}
          <span className="text-xl font-semibold">Mediconnect</span>
        </div>

        {/* Legal Links */}
        <div className="text-center md:text-right space-y-1">
          <p className="text-sm text-gray-600">© 2023 Mediconnect. All rights reserved.</p>
          <p className="text-sm text-gray-600">
            <a href="#" className="hover:underline hover:text-primary">Privacy Policy</a> | <a href="#" className="hover:underline hover:text-primary">Terms of Service</a>
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="flex gap-4 text-gray-500">
          <a href="/"><FaFacebookF className="hover:text-primary transition" /></a>
          <a href="/"><FaTwitter className="hover:text-primary transition" /></a>
          <a href="https://www.instagram.com/_ajay_kumar_.01/"><FaInstagram className="hover:text-primary transition" /></a>
          <a href="https://www.linkedin.com/in/ajaykumar-mekala/"><FaLinkedinIn className="hover:text-primary transition" /></a>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center text-sm text-gray-500 mt-6">
        Built with ❤️ by the Ajay Kumar 
      </div>
    </div>
  );
};

export default Footer;
