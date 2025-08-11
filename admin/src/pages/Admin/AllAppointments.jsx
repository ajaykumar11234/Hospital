import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments,cancelAppointment } = useContext(AdminContext);
  const { calculateAge } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">All Appointments</h2>

      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 bg-gray-200 p-3 rounded font-semibold text-gray-700">
        <p>#</p>
        <p>Patient</p>
        <p>Age</p>
        <p>Date & Time</p>
        <p>Doctor</p>
        <p>Fees</p>
        <p>Action</p>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-300">
        {appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-7 gap-4 items-center p-3 hover:bg-gray-50 transition"
            >
              <p>{index + 1}</p>

              {/* Patient Info */}
              <div className="flex items-center gap-3">
                <img
                  src={item.userData?.image}
                  alt={item.userData?.name || 'Patient'}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <p>{item.userData?.name || '-'}</p>
              </div>

              <p>{item.userData?.dob ? calculateAge(item.userData.dob) : '-'}</p>

              <p>
                {item.slotDate || '-'} <br />
                <span className="text-sm text-gray-500">{item.slotTime || '-'}</span>
              </p>

              {/* Doctor Info */}
              <div className="flex items-center gap-3">
                <img
                  src={item.docData?.image}
                  alt={item.docData?.name || 'Doctor'}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <p>{item.docData?.name || '-'}</p>
              </div>

              <p>₹{item.amount || 0}</p>

              {/* Action Button */}
              {item.cancelled ? (
                <p className="text-red-500 font-medium">Cancelled</p>
              ) : (
                <button onClick={()=>cancelAppointment(item._id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
