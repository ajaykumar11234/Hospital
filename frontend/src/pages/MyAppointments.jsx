import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContextProvider";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const navigate = useNavigate();
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) setAppointments(data.data.reverse());
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message || "Appointment Cancelled Successfully.");
        getUserAppointments();
        getDoctorsData();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verifyRazorpay`,
            response,
            { headers: { token } }
          );
          if (data.success) {
            getUserAppointments();
            navigate("/my-appointments");
          }
        } catch (error) {
          toast.error(error.response?.data?.message || error.message);
        }
      },
    };
    new window.Razorpay(options).open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) initPay(data.order);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) getUserAppointments();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        My Appointments
      </h2>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found.</p>
      ) : (
        <div className="space-y-8">
          {appointments.map((item) => {
            const appointmentDateTime = item.slotDateTime
              ? new Date(item.slotDateTime)
              : item.slotDate && item.slotTime
              ? new Date(`${item.slotDate}T${item.slotTime}`)
              : null;

            const formattedDateTime = appointmentDateTime
              ? appointmentDateTime.toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })
              : "N/A";

            // Show status only if completed or cancelled

            

            return (
              <div
                key={item._id}
                className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 gap-6"
              >
                {/* Doctor Image */}
                <div className="w-full md:w-1/4 flex justify-center md:justify-start">
                  <img
                    src={item.docData.image}
                    alt={item.docData.name}
                    className="w-32 h-32 rounded-lg object-cover border shadow-sm"
                  />
                </div>

                {/* Doctor Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="text-xl font-semibold text-gray-900">{item.docData.name}</p>
                    {status && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                      >
                        {status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 italic">{item.docData.speciality}</p>
                  <p className="text-sm mt-2 text-gray-700">
                    <span className="font-semibold">Date & Time:</span>{" "}
                    <span className="text-blue-600">{formattedDateTime}</span>
                  </p>
                </div>

                {/* Action Buttons or Status */}
<div className="flex flex-col justify-center gap-3 md:w-1/4">
  {/* If appointment is paid and not completed */}
  {!item.cancelled && item.payment && !item.isCompleted && (
    <>
      <button
        className="w-full px-4 py-2 bg-green-600 text-white rounded-full cursor-not-allowed"
        disabled
      >
        Paid
      </button>
      <button
        onClick={() => navigate(`/chat/${item._id}`)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
      >
        Chat with Doctor
      </button>
    </>
  )}

  {/* If appointment is pending */}
  {!item.cancelled && !item.payment && !item.isCompleted && (
    <>
      <button
        onClick={() => appointmentRazorpay(item._id)}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-200"
      >
        Pay Online
      </button>
      <button
        onClick={() => cancelAppointment(item._id)}
        className="w-full px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-200"
      >
        Cancel Appointment
      </button>
    </>
  )}

  {/* Status badge for Cancelled */}
  {item.cancelled && (
    <span className="w-full text-center px-4 py-2 bg-red-100 text-red-800 font-semibold rounded-full">
      Cancelled
    </span>
  )}

  {/* Status badge for Completed */}
  {item.isCompleted && !item.cancelled && (
    <span className="w-full text-center px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-full">
      Completed
    </span>
  )}
</div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
