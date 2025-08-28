import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { assets } from '../assets/assets_frontend/assets';
import { AppContext } from '../context/AppContextProvider';
import RelatedDoctors from '../components/RelatedDoctors';
import ChatRoom from "../components/PatientChatRoom";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, userData } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  // Fetch doctor info when doctors list changes
  useEffect(() => {
    const fetchDocInfo = () => {
      const doctor = doctors.find((doc) => doc._id === docId);
      setDocInfo(doctor);
    };

    if (doctors && doctors.length > 0) {
      fetchDocInfo();
    }
  }, [doctors, docId]);

  // Generate available time slots
  useEffect(() => {
    const getAvailableSlots = async () => {
      if (!docInfo) return;

      const slotsByDay = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        const timeSlots = [];
        const endTime = new Date(currentDate);
        endTime.setHours(21, 0, 0, 0); // 9:00 PM

        if (i === 0) {
          const now = new Date();
          currentDate.setHours(Math.max(now.getHours() + 1, 10));
          currentDate.setMinutes(now.getMinutes() > 30 ? 30 : 0);
        } else {
          currentDate.setHours(10);
          currentDate.setMinutes(0);
        }

        while (currentDate < endTime) {
          const formattedTime = currentDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          let day=currentDate.getDate()
          let month=currentDate.getMonth()+1 
          let year=currentDate.getFullYear()
          const slotDate=day+"_"+month+"_"+year
          const slotTime=formattedTime

          const isSlotAvailable=docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime)?false : true
         

         if(isSlotAvailable){
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
         }

          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }

        slotsByDay.push(timeSlots);
      }

      setDocSlots(slotsByDay);
    };

    getAvailableSlots();
  }, [docInfo]);

  const getDateLabel = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: date.getDate(),
    };
  };

  const bookAppointment = async () => {
  if (!token) {
    toast.warn("Please login to book an appointment");
    return navigate('/login');
  }

  if (!slotTime) {
    toast.warn("Please select a time slot");
    return;
  }

  setIsBooking(true);
  try {
    const selectedDate = docSlots[slotIndex][0].datetime;
    const dateString = selectedDate.toISOString().split('T')[0];
    const timestamp = selectedDate.getTime(); // Convert to timestamp

    // Prepare all required data per your schema
    const appointmentData = {
      docId: docId,
      userId: userData._id,
      slotDate: dateString,
      slotTime: slotTime,
      userData: { // Include required user details
        name: userData.name,
        email: userData.email,
        phone: userData.phone || ''
      },
      docData: { // Include required doctor details
        name: docInfo.name,
        speciality: docInfo.speciality,
        fees: docInfo.fees
      },
      amount: docInfo.fees, // Set the payment amount
      date: timestamp, // Current timestamp
      payment: false, // Default as per schema
      cancelled: false,
      isCompleted: false
    };

    const { data } = await axios.post(
      `${backendUrl}/api/user/book-appointment`,
      appointmentData,
      {
        headers: { 
          token
        }
      }
    );

    if (data.success) {
      toast.success("Appointment booked successfully!");
      navigate('/my-appointments');
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Booking error:", error);
    toast.error(error.response?.data?.message || "Failed to book appointment");
  } finally {
    setIsBooking(false);
  }
};
  if (!docInfo) {
    return <div className="p-6 text-center">Loading doctor information...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      {/* Doctor Info */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        <img
          src={docInfo.image}
          alt="Doctor"
          className="w-40 h-40 rounded-full object-cover border border-gray-300"
        />

        <div className="flex-grow space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-gray-800">{docInfo.name}</p>
            <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
          </div>

          <p className="text-gray-600 text-sm">{docInfo.degree} - {docInfo.speciality}</p>
          <button className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm">
            {docInfo.experience} Experience
          </button>

          <div>
            <div className="flex items-center gap-1 text-gray-700 font-medium mb-1">
              <p>About</p>
              <img src={assets.info_icon} alt="Info" className="w-4 h-4" />
            </div>
            <p className="text-gray-600 text-sm">{docInfo.about}</p>
          </div>

          <p className="text-sm font-medium">
            Appointment Fee: <span className="text-blue-600">{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Booking Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking slots</h3>

        {/* Date Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {docSlots.map((_, index) => {
            const { day, date } = getDateLabel(index);
            return (
              <div
                key={index}
                className={`text-center px-4 py-2 rounded-full cursor-pointer min-w-[60px] ${
                  slotIndex === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setSlotIndex(index);
                  setSlotTime('');
                }}
              >
                <p className="text-xs font-bold">{day}</p>
                <p className="text-sm">{date}</p>
              </div>
            );
          })}
        </div>

        {/* Time Slot Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6">
          {docSlots[slotIndex]?.map((slot, i) => (
            <button
              key={i}
              onClick={() => setSlotTime(slot.time)}
              className={`px-4 py-2 text-sm rounded-full border transition ${
                slotTime === slot.time
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>

        {/* Book Button */}
        <div className="mt-8 text-center">
          <button
            onClick={bookAppointment}
            disabled={!slotTime || isBooking}
            className={`px-6 py-2 rounded-full font-semibold text-white transition ${
              slotTime && !isBooking
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isBooking ? 'Booking...' : 'Book an appointment'}
          </button>
        </div>
   
      </div>

      <RelatedDoctors speciality={docInfo.speciality} docId={docInfo._id} />
    </div>
  );
};

export default Appointment;