import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";

const ActivePatients = () => {
  const { activePatients, getActivePatients } = useContext(DoctorContext);
  const navigate = useNavigate();

  useEffect(() => {
    getActivePatients();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Active Patients</h2>

      {activePatients.length > 0 ? (
        <div className="flex flex-col gap-4">
          {activePatients.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between border-b py-4 px-3 sm:px-4 rounded hover:bg-gray-50 transition gap-3 sm:gap-0"
            >
              {/* Patient Info */}
              <div className="flex items-center gap-3">
                <img
                  src={item.userData?.image || "/default-avatar.png"}
                  alt={item.userData?.name || "Patient"}
                  className="w-14 h-14 sm:w-12 sm:h-12 rounded-full border object-cover"
                />
                <div className="flex flex-col">
                  <p className="font-medium text-sm sm:text-base">{item.userData?.name}</p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {item.slotDate} - {item.slotTime}
                  </p>
                </div>
              </div>

              {/* Chat Button */}
              <div className="flex justify-end sm:justify-start mt-2 sm:mt-0">
                <button
                  onClick={() => navigate(`/doctor/chat/${item._id}`)}
                  className="px-4 py-2 sm:px-5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base rounded transition"
                >
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 py-4 text-center">No active patients found</p>
      )}
    </div>
  );
};

export default ActivePatients;
