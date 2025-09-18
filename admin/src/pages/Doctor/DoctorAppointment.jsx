import React, { useEffect, useContext } from 'react';
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
    <div className="p-4 sm:p-6 space-y-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-2 border-b pb-2">
        Doctor Appointments
      </h2>

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No appointments found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((item, index) => (
            <div
              key={item._id || index}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-6"
            >
              {/* Left section: Patient Info */}
              <div className="flex items-center gap-3 flex-1">
                <span className="text-gray-400 sm:hidden font-semibold">{index + 1}.</span>
                <img
                  src={item.userData?.image || '/default-avatar.png'}
                  alt={item.userData?.name || 'Patient'}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border"
                />
                <div>
                  <p className="font-medium">{item.userData?.name || 'Unknown'}</p>
                  <p className="text-gray-500 text-sm">
                    Age: {calculateAge(item.userData?.dob) || 'N/A'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {item.slotDate} - {item.slotTime}
                  </p>
                  <p className={item.payment ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                    {item.payment ? 'Paid Online' : 'Cash'}
                  </p>
                </div>
              </div>

              {/* Right section: Actions / Status */}
              <div className="flex flex-wrap gap-2 justify-end items-center mt-2 sm:mt-0">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;
