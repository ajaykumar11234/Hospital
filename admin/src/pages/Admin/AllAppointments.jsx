import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge } = useContext(AppContext);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (aToken) getAllAppointments();
  }, [aToken]);

  const filteredAppointments = appointments.filter((item) => {
    const patientName = item.userData?.name?.toLowerCase() || "";
    const doctorName = item.docData?.name?.toLowerCase() || "";
    const matchesSearch =
      patientName.includes(search.toLowerCase()) ||
      doctorName.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Completed"
        ? item.isCompleted
        : statusFilter === "Cancelled"
        ? item.cancelled
        : !item.cancelled && !item.isCompleted; // Upcoming

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center sm:text-left">
        All Appointments
      </h2>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by patient or doctor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-1/4 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="All">All</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 gap-4 bg-gray-200 p-3 rounded font-semibold text-gray-700">
            <p>S.No</p>
            <p>Patient</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Doctor</p>
            <p>Fees</p>
            <p>Action</p>
          </div>
          <div className="divide-y divide-gray-300">
            {filteredAppointments.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-7 gap-4 items-center p-3 hover:bg-gray-50 transition rounded-md"
              >
                <p>{index + 1}</p>
                <div className="flex items-center gap-3">
                  <img
                    src={item.userData?.image}
                    alt={item.userData?.name || "Patient"}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <p className="font-medium">{item.userData?.name || "-"}</p>
                </div>
                <p className="text-gray-600">
                  {item.userData?.dob ? calculateAge(item.userData.dob) : "-"}
                </p>
                <div>
                  <p>{item.slotDate || "-"}</p>
                  <span className="text-sm text-gray-500">{item.slotTime || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={item.docData?.image}
                    alt={item.docData?.name || "Doctor"}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <p className="font-medium">{item.docData?.name || "-"}</p>
                </div>
                <p className="font-semibold text-gray-800">₹{item.amount || 0}</p>
                {item.cancelled ? (
                  <p className="text-red-500 font-medium">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-600 font-medium">Completed</p>
                ) : (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Patient: {item.userData?.name || "-"}</p>
                <p className={`font-semibold ${
                  item.cancelled ? "text-red-500" :
                  item.isCompleted ? "text-green-600" : "text-yellow-600"
                }`}>
                  {item.cancelled ? "Cancelled" : item.isCompleted ? "Completed" : "Upcoming"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
                <p>Doctor: {item.docData?.name || "-"}</p>
                <p>Age: {item.userData?.dob ? calculateAge(item.userData.dob) : "-"}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
                <p>Date: {item.slotDate || "-"}</p>
                <p>Time: {item.slotTime || "-"}</p>
              </div>

              <p className="font-semibold mb-2">Fees: ₹{item.amount || 0}</p>

              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md text-sm"
                >
                  Cancel Appointment
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
