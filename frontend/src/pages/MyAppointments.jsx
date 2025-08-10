import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContextProvider';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useNavigate} from "react-router-dom"

const MyAppointments = () => {

 const navigate=useNavigate()
  const { backendUrl, token , getDoctorsData} = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.data.reverse());
        console.log('Appointments:', data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
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
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

const initPay = (order) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "Appointment payment",
    description: "Appointment payment",
    order_id: order.id,
    receipt: order.receipt,
    handler: async (response) => {
      console.log(response);
      try{
      const {data}=await axios.post(backendUrl+"/api/user/verifyRazorpay",response,{headers:{token}})
     
     if(data.success){
     getUserAppointments()
     navigate("/my-appointments")

     }
      }
      catch(error){
      console.log(error)
      toast.error(error.message)
      }

    }
  };

const rzp=new window.Razorpay(options)

rzp.open()
};


const appointmentRazorpay= async (appointmentId)=>{
try{
const {data} =await axios.post(backendUrl+"/api/user/payment-razorpay",{appointmentId},{headers:{token}})

if(data.success){
// console.log(data.order)
initPay(data.order)

}
}
catch(error){


}
}
  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Appointments</h2>

      <div className="space-y-8">
        {appointments.length === 0 && (
          <p className="text-center text-gray-500">No appointments found.</p>
        )}

        {appointments.map((item, index) => (
          <div
            key={index}
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
            <div className="flex-1 space-y-1">
              <p className="text-xl font-semibold text-gray-900">{item.docData.name}</p>
              <p className="text-sm text-gray-500 italic">{item.docData.speciality}</p>

              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700">Address:</p>
                {(() => {
                  try {
                    const parsed = JSON.parse(item.docData.address);
                    return Array.isArray(parsed)
                      ? parsed.map((line, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            {line}
                          </p>
                        ))
                      : (
                        <p className="text-sm text-gray-600">{parsed}</p>
                      );
                  } catch {
                    return (
                      <p className="text-sm text-gray-600">{item.docData.address}</p>
                    );
                  }
                })()}
              </div>

              <p className="text-sm mt-3 text-gray-700">
                <span className="font-semibold">Date & Time:</span>{' '}
                <span className="text-blue-600">
                  {item.slotDate
                    ? new Date(item.slotDate).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                      })
                    : 'N/A'}
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col justify-center gap-3 md:w-1/4">
            
{!item.cancelled && item.payment && <button className="w-full px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-200">Paid</button>}
{!item.cancelled && !item.payment &&
              <button onClick={()=>appointmentRazorpay(item._id)}className="w-full px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-200">
                Pay Online
              </button>
}

              {!item.cancelled && !item.payment && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-200"
                >
                  Cancel Appointment
                </button>
              )}
              {item.cancelled && <button className="w-full px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-200">Appointment Cancelled</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
