import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContextProvider";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyDoctors = () => {
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // for modal

  const getUserAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });

      if (data.success) {
        // Get all active appointments (payment done, not cancelled, not completed)
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
  };

  useEffect(() => {
    if (token) getUserAppointments();
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        My Doctors
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading doctors...</p>
      ) : appointments.length === 0 ? (
        <p className="text-center text-gray-500">No active appointments found.</p>
      ) : (
        <div className="space-y-8">
          {appointments.map((a) => (
            <div
              key={a._id}
              className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 p-6 gap-6"
            >
              {/* Doctor Image */}
              <div className="w-full md:w-1/4 flex justify-center md:justify-start">
                <img
                  src={a.docData.image}
                  alt={`Dr. ${a.docData.name}`}
                  className="w-32 h-32 rounded-lg object-cover border shadow-sm"
                />
              </div>

              {/* Doctor Info */}
              <div className="flex-1 space-y-1">
                <p className="text-xl font-semibold text-gray-900">{a.docData.name}</p>
                <p className="text-sm text-gray-500 italic">{a.docData.speciality}</p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col justify-center md:w-1/4 gap-2">
                <button
                  onClick={() => navigate(`/chat/${a._id}`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
                >
                  Chat with Doctor
                </button>
                <button
                  onClick={() => setSelectedAppointment(a)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 md:w-1/3 relative">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg font-bold"
            >
              &times;
            </button>
            <div className="flex flex-col items-center space-y-4">
              <img
                src={selectedAppointment.docData.image}
                alt={`Dr. ${selectedAppointment.docData.name}`}
                className="w-32 h-32 rounded-lg object-cover border shadow-sm"
              />
              <p className="text-xl font-semibold">{selectedAppointment.docData.name}</p>
              <p className="text-gray-500 italic">{selectedAppointment.docData.speciality}</p>
              <p className="text-gray-700">
                Appointment ID: <span className="font-medium">{selectedAppointment._id}</span>
              </p>
              {selectedAppointment.date && (
                <p className="text-gray-700">
                  Date: <span className="font-medium">{new Date(selectedAppointment.date).toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDoctors;
