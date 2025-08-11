import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';

const DoctorAppointment = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } =
    useContext(DoctorContext);
  const { calculateAge } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken, getAppointments]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Doctor Appointments</h2>

      {/* Header Row */}
      <div className="grid grid-cols-6 gap-4 font-semibold bg-gray-100 p-3 rounded-md">
        <p>#</p>
        <p>Patient</p>
        <p>Payment</p>
        <p>Age</p>
        <p>Date & Time</p>
        <p className="text-center">Action</p>
      </div>

      {/* Data Rows */}
      {appointments.length > 0 ? (
        appointments.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-6 gap-4 items-center border-b py-3 hover:bg-gray-50 transition"
          >
            {/* Index */}
            <p>{index + 1}</p>

            {/* Patient Info */}
            <div className="flex items-center gap-3">
              <img
                src={item.userData?.image || '/default-avatar.png'}
                alt={item.userData?.name || 'Patient'}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <p className="font-medium">{item.userData?.name || 'Unknown'}</p>
            </div>

            {/* Payment */}
            <p className={item.payment ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
              {item.payment ? 'Online' : 'Cash'}
            </p>

            {/* Age */}
            <p>{calculateAge(item.userData?.dob) || 'N/A'}</p>

            {/* Date & Time */}
            <p>{item.slotDate} - {item.slotTime}</p>

            {/* Action */}
            {item.cancelled ? (
              <p className="text-red-500 font-medium text-center">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 font-medium text-center">Completed</p>
            ) : (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => completeAppointment(item._id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Complete
                </button>
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="mt-6 text-gray-500 text-center">No appointments found.</p>
      )}
    </div>
  );
};

export default DoctorAppointment;
