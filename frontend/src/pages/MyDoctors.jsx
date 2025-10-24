import React, { useContext, useState, useEffect, useCallback, useRef } from "react";
import { AppContext } from "../context/AppContextProvider";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyDoctors = () => {
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const modalRef = useRef(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const getUserAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });

      if (data.success) {
        const activeAppointments = data.data.filter(
          (a) => a.payment && !a.cancelled && !a.isCompleted
        );
        setAppointments(activeAppointments);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token, getUserAppointments]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && selectedAppointment) {
        setSelectedAppointment(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedAppointment]);

  // Focus management for modal
  useEffect(() => {
    if (selectedAppointment && modalRef.current) {
      modalRef.current.focus();
    }
  }, [selectedAppointment]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedAppointment) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedAppointment]);

  const handleChatClick = (appointmentId) => {
    try {
      navigate(`/chat/${appointmentId}`);
    } catch (error) {
      toast.error("Unable to open chat. Please try again.");
    }
  };

  const handleModalClose = () => {
    setSelectedAppointment(null);
  };

  const handleBookAppointment = () => {
    navigate("/doctors");
  };

  const formatAppointmentDate = (date) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        My Doctors
      </h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading your doctors...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Appointments
          </h3>
          <p className="text-gray-500 mb-6">
            You don't have any active appointments with doctors yet.
          </p>
          <button
            onClick={handleBookAppointment}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200 font-medium"
          >
            Book an Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {appointments.map((a) => (
            <article
              key={a._id}
              className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 p-6 gap-6"
            >
              <div className="w-full md:w-1/4 flex justify-center md:justify-start">
                <img
                  src={a.docData.image}
                  alt={`Dr. ${a.docData.name}`}
                  className="w-32 h-32 rounded-lg object-cover border shadow-sm"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  Dr. {a.docData.name}
                </h2>
                <p className="text-sm text-gray-500 italic">
                  {a.docData.speciality}
                </p>
                {a.date && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Next Appointment:</span>{" "}
                    {formatAppointmentDate(a.date)}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-center md:w-1/4 gap-2">
                <button
                  onClick={() => handleChatClick(a._id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                  aria-label={`Chat with Dr. ${a.docData.name}`}
                >
                  Chat with Doctor
                </button>
                <button
                  onClick={() => setSelectedAppointment(a)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200"
                  aria-label={`View details for Dr. ${a.docData.name}`}
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={handleModalClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-xl p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <button
              onClick={handleModalClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="flex flex-col items-center space-y-4 mt-4">
              <img
                src={selectedAppointment.docData.image}
                alt={`Dr. ${selectedAppointment.docData.name}`}
                className="w-32 h-32 rounded-lg object-cover border shadow-sm"
              />
              <h2 id="modal-title" className="text-2xl font-semibold text-gray-900">
                Dr. {selectedAppointment.docData.name}
              </h2>
              <p className="text-gray-500 italic text-center">
                {selectedAppointment.docData.speciality}
              </p>

              <div className="w-full bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Appointment ID:</span>
                  <br />
                  <span className="text-sm font-mono text-gray-600">
                    {selectedAppointment._id}
                  </span>
                </p>

                {selectedAppointment.date && (
                  <p className="text-gray-700">
                    <span className="font-medium">Date & Time:</span>
                    <br />
                    <span className="text-gray-600">
                      {formatAppointmentDate(selectedAppointment.date)}
                    </span>
                  </p>
                )}

                {selectedAppointment.slotTime && (
                  <p className="text-gray-700">
                    <span className="font-medium">Time Slot:</span>
                    <br />
                    <span className="text-gray-600">
                      {selectedAppointment.slotTime}
                    </span>
                  </p>
                )}

                {selectedAppointment.amount && (
                  <p className="text-gray-700">
                    <span className="font-medium">Amount Paid:</span>
                    <br />
                    <span className="text-gray-600">
                      ${selectedAppointment.amount}
                    </span>
                  </p>
                )}
              </div>

              <button
                onClick={handleModalClose}
                className="mt-4 w-full px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDoctors;