import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContextProvider";
import RelatedDoctors from "../components/RelatedDoctors";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  // Fetch doctor info
  useEffect(() => {
    if (doctors && doctors.length > 0) {
      const doctor = doctors.find((d) => d._id === docId);
      setDocInfo(doctor || null);
    }
  }, [doctors, docId]);

  // Generate slots for 7 days
  useEffect(() => {
    if (!docInfo) return;

    const slotsByDay = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const timeSlots = [];
      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0); // 9 PM

      if (i === 0) {
        const now = new Date();
        currentDate.setHours(Math.max(now.getHours() + 1, 10));
        currentDate.setMinutes(0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      while (currentDate <= endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
        const slotDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

        const isSlotAvailable =
          !docInfo.slots_booked?.[slotDate] || !docInfo.slots_booked[slotDate].includes(formattedTime);

        if (isSlotAvailable) {
          timeSlots.push({ datetime: new Date(currentDate), time: formattedTime, slotDate });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      slotsByDay.push(timeSlots);
    }

    setDocSlots(slotsByDay);
  }, [docInfo]);

  const getDateLabel = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: date.getDate(),
    };
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Please login to book an appointment");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }

    setIsBooking(true);

    try {
      const selectedSlot = docSlots[slotIndex].find((s) => s.time === slotTime);
      if (!selectedSlot) {
        toast.error("Selected slot is invalid");
        setIsBooking(false);
        return;
      }

      const appointmentData = {
        docId,
        slotDate: selectedSlot.slotDate,
        slotTime: selectedSlot.time,
        slotDateTime: selectedSlot.datetime,
      };

      const { data } = await axios.post(`${backendUrl}/api/user/book-appointment`, appointmentData, {
        headers: { token },
      });

      if (data.success) {
        toast.success("Appointment booked successfully!");
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  if (!docInfo) return <div className="p-6 text-center">Loading doctor information...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      {/* Doctor Info */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        <img
          src={docInfo.image || "/default-doctor.png"}
          alt={docInfo.name || "Doctor"}
          className="w-40 h-40 rounded-full object-cover border border-gray-300"
        />
        <div className="flex-grow space-y-2">
          <p className="text-2xl font-semibold text-gray-800">{docInfo.name}</p>
          <p className="text-gray-600 text-sm">{docInfo.degree} - {docInfo.speciality}</p>
          <p className="text-sm font-medium">
            Fee: <span className="text-blue-600">{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Booking Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Booking Slot</h3>

        {/* Date Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {docSlots.map((_, index) => {
            const { day, date } = getDateLabel(index);
            return (
              <div
                key={index}
                className={`text-center px-4 py-2 rounded-full cursor-pointer min-w-[60px] ${
                  slotIndex === index ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => { setSlotIndex(index); setSlotTime(""); }}
              >
                <p className="text-xs font-bold">{day}</p>
                <p className="text-sm">{date}</p>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6">
          {docSlots[slotIndex]?.map((slot, i) => (
            <button
              key={i}
              onClick={() => setSlotTime(slot.time)}
              className={`px-4 py-2 text-sm rounded-full border transition ${
                slotTime === slot.time
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
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
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isBooking ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </div>

      {/* Related Doctors */}
      <RelatedDoctors speciality={docInfo.speciality} docId={docInfo._id} />
    </div>
  );
};

export default Appointment;
