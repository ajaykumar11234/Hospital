import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { assets } from '../assets/assets_admin/assets';

const Sidebar = () => {
  // Try to get contexts, they might be undefined
  const adminContext = useContext(AdminContext);
  const doctorContext = useContext(DoctorContext);
  
  const aToken = adminContext?.aToken || localStorage.getItem('aToken');
  const dToken = doctorContext?.dToken || localStorage.getItem('dToken');

  // Common NavLink style generator
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded-md transition ${
      isActive
        ? 'bg-blue-100 text-blue-600 font-semibold'
        : 'text-gray-700 hover:text-blue-600'
    }`;

  return (
    <div className="w-64 bg-white p-4 shadow-md min-h-screen">
      {/* Admin Sidebar */}
      {aToken && (
        <ul className="space-y-4">
          <li>
            <NavLink to="/admin/dashboard" className={linkClasses}>
              <img src={assets.home_icon} alt="Dashboard" className="h-6 w-6" />
              <p>Dashboard</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/appointments" className={linkClasses}>
              <img src={assets.appointment_icon} alt="Appointments" className="h-6 w-6" />
              <p>Appointments</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/add-doctor" className={linkClasses}>
              <img src={assets.add_icon} alt="Add Doctor" className="h-6 w-6" />
              <p>Add Doctor</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/add-medicine" className={linkClasses}>
              <img src={assets.add_icon} alt="Add Medicine" className="h-6 w-6" />
              <p>Add Medicine</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/doctors" className={linkClasses}>
              <img src={assets.people_icon} alt="Doctors List" className="h-6 w-6" />
              <p>Doctors List</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/orders" className={linkClasses}>
              <img src={assets.people_icon} alt="Orders" className="h-6 w-6" />
              <p>Orders</p>
            </NavLink>
          </li>
          <li>
          <NavLink to="/admin/medicines" className={linkClasses}>
              <img src={assets.appointment_icon} alt="Medicines" className="h-6 w-6" />
              <p>Medicine Stock</p>
            </NavLink>
          </li>
        </ul>
      )}

      {/* Doctor Sidebar */}
      {dToken && (
        <ul className="space-y-4">
          <li>
            <NavLink to="/doctor/dashboard" className={linkClasses}>
              <img src={assets.home_icon} alt="Dashboard" className="h-6 w-6" />
              <p>Dashboard</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor/appointments" className={linkClasses}>
              <img src={assets.appointment_icon} alt="Appointments" className="h-6 w-6" />
              <p>Appointments</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor/active-patients" className={linkClasses}>
              <img src={assets.people_icon} alt="Profile" className="h-6 w-6" />
              <p>Patient Chat</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor/profile" className={linkClasses}>
              <img src={assets.people_icon} alt="Profile" className="h-6 w-6" />
              <p>Profile</p>
            </NavLink>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
