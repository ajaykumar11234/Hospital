import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { AuthContext } from '../../context/AuthContext';
import { assets } from '../assets/assets_admin/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const adminContext = useContext(AdminContext);
  const doctorContext = useContext(DoctorContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const aToken = adminContext?.aToken;
  const setAToken = adminContext?.setAToken;
  const dToken = doctorContext?.dToken || localStorage.getItem('dToken');
  const setDToken = doctorContext?.setDToken;

 const handleLogout = () => {
  if (aToken) {
    localStorage.removeItem('aToken');
    if (setAToken) setAToken(null);
    toast.success('Admin logged out successfully!');
  }

  if (dToken) {
    localStorage.removeItem('dToken');
    if (setDToken) setDToken(null);
    toast.success('Doctor logged out successfully!');
  }

  // Also clear AuthContext
  logout();
  navigate('/login');
};

  

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="flex items-center gap-4">
        <img src={assets.logo} alt="Admin Logo" className="h-15 w-40" />
        <p className="font-semibold text-gray-700 text-lg ml-10">
          {aToken ? 'Admin' : 'Doctor'}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
