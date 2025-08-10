import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContextProvider';

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const specialities = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
  ];

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-12 py-10 gap-10">
      {/* Sidebar */}
      <div className="w-full md:w-[20%]">
        <p className="text-lg font-medium mb-4">Browse through the doctors specialist.</p>
        <div className="flex flex-col gap-3">
          {specialities.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(`/doctors/${item}`)}
              className={`px-4 py-2 border rounded-md text-sm bg-white hover:bg-blue-100 transition text-gray-800 text-left ${
                item === speciality ? 'bg-blue-200 font-semibold' : ''
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="w-full md:w-[80%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filterDoc.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(`/appointment/${item._id}`)}
            className="bg-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer text-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded-md mb-3"
            />
            <p className="text-green-600 text-sm mb-1 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              Available
            </p>
            <p className="font-semibold text-lg"> {item.name}</p>
            <p className="text-sm text-gray-600">{item.speciality}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;
