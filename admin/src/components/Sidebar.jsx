import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { assets } from '../assets/assets_admin/assets';

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);

  return (
    <div className="w-64 bg-white p-4 shadow-md min-h-screen">
      {aToken && (
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-md ${
                  isActive ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <img src={assets.home_icon} alt="Dashboard" className="h-6 w-6" />
              <p>Dashboard</p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/all-appointments"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-md ${
                  isActive ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <img src={assets.appointment_icon} alt="Appointments" className="h-6 w-6" />
              <p>Appointments</p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/add-doctor"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-md ${
                  isActive ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <img src={assets.add_icon} alt="Add Doctor" className="h-6 w-6" />
              <p>Add Doctor</p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/doctor-list"
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-md ${
                  isActive ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`
              }
            >
              <img src={assets.people_icon} alt="Doctors List" className="h-6 w-6" />
              <p>Doctors List</p>
            </NavLink>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
