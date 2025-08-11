import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { assets } from '../assets/assets_admin/assets';

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

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
            <NavLink to="/admin-dashboard" className={linkClasses}>
              <img src={assets.home_icon} alt="Dashboard" className="h-6 w-6" />
              <p>Dashboard</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/all-appointments" className={linkClasses}>
              <img src={assets.appointment_icon} alt="Appointments" className="h-6 w-6" />
              <p>Appointments</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/add-doctor" className={linkClasses}>
              <img src={assets.add_icon} alt="Add Doctor" className="h-6 w-6" />
              <p>Add Doctor</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor-list" className={linkClasses}>
              <img src={assets.people_icon} alt="Doctors List" className="h-6 w-6" />
              <p>Doctors List</p>
            </NavLink>
          </li>
        </ul>
      )}

      {/* Doctor Sidebar */}
      {dToken && (
        <ul className="space-y-4">
          <li>
            <NavLink to="/doctor-dashboard" className={linkClasses}>
              <img src={assets.home_icon} alt="Dashboard" className="h-6 w-6" />
              <p>Dashboard</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor-appointments" className={linkClasses}>
              <img src={assets.appointment_icon} alt="Appointments" className="h-6 w-6" />
              <p>Appointments</p>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor-profile" className={linkClasses}>
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
