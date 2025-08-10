import React from 'react'
import { specialityData } from '../assets/assets_frontend/assets';
import { Link } from 'react-router-dom';

const SpecialityMenu = () => {
  return (
    <div id="speciality" className="px-6 md:px-10 lg:px-20 py-12 bg-white text-center">
      {/* Section Heading */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
        Find by Speciality
      </h1>
      <p className="text-sm md:text-base text-gray-600 mb-10 max-w-2xl mx-auto">
        Simply browse through our extensive list of trusted doctors, schedule your appointments
      </p>

      {/* Specialities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-center">
        {specialityData.map((item, index) => (
          <Link
            key={index}
            to={`/doctors/${item.speciality}`}
            className="flex flex-col items-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            <img
              src={item.image}
              alt={item.speciality}
              className="w-16 h-16 object-contain"
            />
            <p className="text-sm font-medium text-gray-700">{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};


export default SpecialityMenu
