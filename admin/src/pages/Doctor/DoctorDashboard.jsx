import React, { useEffect, useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets_admin/assets";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const { dashData, getDashData, dToken, cancelAppointment } =
    useContext(DoctorContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (dToken) getDashData();
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
    { icon: assets.earning_icon, value: formatCurrency(dashData.earnings), label: "Earnings" },
    { icon: assets.appointment_icon, value: dashData.appointments, label: "Appointments" },
    { icon: assets.patients_icon, value: dashData.patients, label: "Patients" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition"
          >
            <img src={item.icon} alt={item.label} className="w-12 h-12 sm:w-16 sm:h-16" />
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold">{item.value}</p>
              <p className="text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Bookings */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <img src={assets.list_icon} alt="Latest Bookings" className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          <p className="text-lg sm:text-xl font-semibold">Latest Bookings</p>
        </div>

        <div className="divide-y">
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-3 sm:gap-0"
              >
                {/* Patient Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={item.userData.image || "/default-avatar.png"}
                    alt={item.userData.name || "Patient"}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm sm:text-base">{item.userData.name}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{item.slotDate}</p>
                  </div>
                </div>

                {/* Status / Actions */}
                <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap">
                  {item.cancelled ? (
                    <p className="text-red-500 font-medium">Cancelled</p>
                  ) : item.isCompleted ? (
                    <p className="text-green-500 font-medium">Completed</p>
                  ) : (
                    <>
                      {!item.payment ? (
                        <p className="text-yellow-600 font-medium text-sm">Awaiting Payment</p>
                      ) : (
                        <button
                          onClick={() => cancelAppointment(item._id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                        >
                          Cancel
                        </button>
                      )}
                    </>
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
