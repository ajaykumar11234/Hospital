import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { assets } from '../assets/assets_admin/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem('aToken');
    setAToken(null);
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="flex items-center gap-4">
        <img src={assets.admin_logo} alt="Admin Logo" className="h-10 w-auto" />
        <p className="font-semibold text-gray-700 text-lg">
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
