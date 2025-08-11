import React, { useEffect, useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets_admin/assets";

const DoctorDashboard = () => {
  const { dashData, getDashData, dToken, cancelAppointment } =
    useContext(DoctorContext);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken, getDashData]);

  if (!dashData) {
    return (
      <p className="text-center text-gray-500 mt-10">Loading dashboard...</p>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const dashboardItems = [
    {
      icon: assets.earning_icon,
      value: formatCurrency(dashData.earnings),
      label: "Earnings",
    },
    {
      icon: assets.appointment_icon,
      value: dashData.appointments,
      label: "Appointments",
    },
    {
      icon: assets.patients_icon,
      value: dashData.patients,
      label: "Patients",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-6 p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition"
          >
            <img src={item.icon} alt={item.label} className="w-16 h-16" />
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Bookings */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center mb-4">
          <img
            src={assets.list_icon}
            alt="Latest Bookings"
            className="w-6 h-6 mr-2"
          />
          <p className="text-lg font-semibold">Latest Bookings</p>
        </div>

        <div className="divide-y">
          {dashData.latestAppointments &&
          dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3"
              >
                {/* Patient Info */}
                <div className="flex items-center">
                  <img
                    src={item.userData.image}
                    alt={item.userData.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <p className="font-medium">{item.userData.name}</p>
                    <p className="text-gray-500 text-sm">{item.slotDate}</p>
                  </div>
                </div>

                {/* Status / Action */}
                <div>
                  {item.cancelled ? (
                    <p className="text-red-500 font-medium">Cancelled</p>
                  ) : item.isCompleted ? (
                    <p className="text-green-500 font-medium">Completed</p>
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
            <p className="text-gray-500 py-3">No recent bookings</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
