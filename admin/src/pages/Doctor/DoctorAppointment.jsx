import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';

const DoctorAppointment = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } =
    useContext(DoctorContext);
  const { calculateAge } = useContext(AppContext);

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken, getAppointments]);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 border-b pb-2">
        Doctor Appointments
      </h2>

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-4 font-semibold bg-gray-100 p-3 rounded-md">
            <p>S.No.</p>
            <p>Patient</p>
            <p>Payment</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p className="text-center">Status</p>
          </div>

          {/* Data Rows */}
          {appointments.length > 0 ? (
            appointments.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-6 gap-4 items-center border-b py-3 hover:bg-gray-50 transition"
              >
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
                <p>
                  {item.slotDate} - {item.slotTime}
                </p>

                {/* Status */}
                <div className="flex flex-col sm:flex-row sm:justify-center gap-2 w-full sm:w-auto text-center mt-2 sm:mt-0">
                  {item.cancelled ? (
                    <p className="text-red-500 font-medium">Cancelled</p>
                  ) : item.isCompleted ? (
                    <p className="text-green-500 font-medium">Completed</p>
                  ) : (
                    <>
                      <button
                        onClick={() => completeAppointment(item._id)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="mt-6 text-gray-500 text-center">No appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointment;
