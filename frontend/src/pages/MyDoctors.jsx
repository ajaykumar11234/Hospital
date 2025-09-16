import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContextProvider";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyDoctors = () => {
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });

      if (data.success) {
        // ✅ Filter only paid, not cancelled, not completed
        const filtered = data.data.filter(
          (a) => a.payment && !a.cancelled && !a.isCompleted
        );

        // ✅ Keep doctors with appointmentId (remove duplicate doctor, keep latest active appointment)
        const doctorMap = new Map();
        filtered.forEach((a) => {
          if (!doctorMap.has(a.docData._id)) {
            doctorMap.set(a.docData._id, {
              doctorId: a.docData._id,
              name: a.docData.name,
              speciality: a.docData.speciality,
              image: a.docData.image,
              appointmentId: a._id, // ✅ include appointmentId
            });
          }
        });

        setDoctors(Array.from(doctorMap.values())); // remove duplicates
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        My Doctors
      </h2>

      <div className="space-y-8">
        {doctors.length === 0 && (
          <p className="text-center text-gray-500">No active doctors found.</p>
        )}

        {doctors.map((doc, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 gap-6"
          >
            {/* Doctor Image */}
            <div className="w-full md:w-1/4 flex justify-center md:justify-start">
              <img
                src={doc.image}
                alt={doc.name}
                className="w-32 h-32 rounded-lg object-cover border shadow-sm"
              />
            </div>

            {/* Doctor Info */}
            <div className="flex-1 space-y-1">
              <p className="text-xl font-semibold text-gray-900">{doc.name}</p>
              <p className="text-sm text-gray-500 italic">{doc.speciality}</p>
            </div>

            {/* Chat Button */}
            <div className="flex flex-col justify-center md:w-1/4">
              <button
                onClick={() =>
                  navigate(`/chat/${doc.appointmentId}`) // ✅ doctor + appointment
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
              >
                Chat with Doctor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyDoctors;
