import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) getAllDoctors();
  }, [aToken]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center">
        All Doctors
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg shadow p-4 flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-24 sm:w-32 md:w-40 lg:w-48 h-48 object-cover rounded-full"
            />

            <h2 className="text-base sm:text-lg md:text-xl font-bold">{item.name}</h2>

            <p className="text-sm sm:text-base text-gray-700 font-medium">{item.speciality}</p>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                onChange={() => changeAvailability(item._id)}
                checked={item.available}
                className="form-checkbox h-5 w-5 text-green-500 cursor-pointer"
              />
              <span
                className={`text-sm sm:text-base font-medium ${
                  item.available ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {item.available ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
