import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContextProvider'; // make sure this path is correct

const TopDoctors = () => {
  const { doctors } = useContext(AppContext); // ✅ useContext inside component
  const navigate = useNavigate();

  return (
    <div className="px-6 md:px-10 lg:px-20 py-10 bg-white">
      {/* Heading and Description Centered */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Top Doctors To Book
        </h1>
        <p className="text-gray-600">
          Simply browse through our extensive list of trusted doctors.
        </p>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {doctors.slice(0, 10).map((item, index) => (
          <div
            onClick={() => navigate(`/appointment/${item._id}`)}
            key={index}
            className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded-md mb-3"
            />
            <p className="text-green-600 text-sm mb-1 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              Available
            </p>

            <div className="mb-3">
              <p className="font-semibold text-lg">{item.name}</p>
              <p className="text-sm text-gray-600">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      {/* More Button */}
      <div className="flex justify-center mt-8">
        <button  onClick={()=>{navigate('/doctors')}}className="bg-primary text-white px-6 py-3 rounded hover:bg-opacity-90">
          More
        </button>
      </div>
    </div>
  );
};

export default TopDoctors;
