import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { assets } from '../../assets/assets_admin/assets';

const Dashboard = () => {
  const { aToken, getdashData, dashData, cancelAppointment } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getdashData();
    }
  }, [aToken]);

  return (
    dashData && (
      <div className="p-6 space-y-8">
        {/* Header */}
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Doctors */}
          <div className="flex items-center bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
            <img src={assets.doctor_icon} alt="Doctors" className="w-12 h-12 mr-4" />
            <div>
              <p className="text-2xl font-semibold">{dashData.doctors}</p>
              <p className="text-gray-500">Doctors</p>
            </div>
          </div>

          {/* Patients */}
          <div className="flex items-center bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
            <img src={assets.patients_icon} alt="Patients" className="w-12 h-12 mr-4" />
            <div>
              <p className="text-2xl font-semibold">{dashData.patients}</p>
              <p className="text-gray-500">Patients</p>
            </div>
          </div>

          {/* Appointments */}
          <div className="flex items-center bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
            <img src={assets.appointment_icon} alt="Appointments" className="w-12 h-12 mr-4" />
            <div>
              <p className="text-2xl font-semibold">{dashData.appointments}</p>
              <p className="text-gray-500">Appointments</p>
            </div>
          </div>
        </div>

        {/* Latest Bookings */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center mb-4">
            <img src={assets.list_icon} alt="Latest Bookings" className="w-6 h-6 mr-2" />
            <p className="text-lg font-semibold">Latest Bookings</p>
          </div>

          <div className="divide-y">
            {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
              dashData.latestAppointments.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3"
                >
                  {/* Doctor Info */}
                  <div className="flex items-center">
                    <img
                      src={item.docData.image}
                      alt={item.docData.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <p className="font-medium">{item.docData.name}</p>
                      <p className="text-gray-500 text-sm">{item.slotDate}</p>
                    </div>
                  </div>

                  {/* Status / Action */}
                  <div>
                    {item.cancelled ? (
                      <p className="text-red-500 font-medium">Cancelled</p>
                    ) : (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent bookings.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
