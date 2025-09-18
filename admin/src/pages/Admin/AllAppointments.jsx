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
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  // Filtering logic
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
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">All Appointments</h2>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by patient or doctor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />

        {/* Filter */}
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

      {/* Table Header (hidden on mobile) */}
      <div className="hidden md:grid grid-cols-7 gap-4 bg-gray-200 p-3 rounded font-semibold text-gray-700">
        <p>S.No</p>
        <p>Patient</p>
        <p>Age</p>
        <p>Date & Time</p>
        <p>Doctor</p>
        <p>Fees</p>
        <p>Action</p>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-300">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center p-3 hover:bg-gray-50 transition rounded-md"
            >
              {/* Serial No. */}
              <p className="hidden md:block">{index + 1}</p>

              {/* Patient Info */}
              <div className="flex items-center gap-3">
                <img
                  src={item.userData?.image}
                  alt={item.userData?.name || "Patient"}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <p className="font-medium">{item.userData?.name || "-"}</p>
              </div>

              {/* Age */}
              <p className="text-gray-600">
                {item.userData?.dob ? calculateAge(item.userData.dob) : "-"}
              </p>

              {/* Date & Time */}
              <div>
                <p>{item.slotDate || "-"}</p>
                <span className="text-sm text-gray-500">
                  {item.slotTime || "-"}
                </span>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-3">
                <img
                  src={item.docData?.image}
                  alt={item.docData?.name || "Doctor"}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <p className="font-medium">{item.docData?.name || "-"}</p>
              </div>

              {/* Fees */}
              <p className="font-semibold text-gray-800">
                ₹{item.amount || 0}
              </p>

              {/* Action / Status */}
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
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            No appointments found
          </p>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
