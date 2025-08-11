import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { assets } from '../assets/assets_admin/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DoctorContext } from '../context/DoctorContext';

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const {dToken,setDToken}=useContext(DoctorContext)
  const navigate = useNavigate();

 const handleLogout = () => {
  if (aToken) {
    localStorage.removeItem('aToken');
    setAToken(null);
    toast.success('Admin logged out successfully!');
  }

  if (dToken) {
    localStorage.removeItem('dToken');
    setDToken(null);
    toast.success('Doctor logged out successfully!');
  }

  navigate('/');
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
