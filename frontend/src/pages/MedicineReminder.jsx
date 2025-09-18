import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

function MedicineReminder() {
  const [medicineName, setMedicineName] = useState('');
  const [times, setTimes] = useState(['']);
  const [toEmail, setToEmail] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [reminders, setReminders] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ✅ Load backend URL from env
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    if (!token) {
      toast.info('Please login.');
      navigate('/login');
      return;
    }
    fetchReminders();
  }, [token]);

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/reminder/list`, {
        headers: { token },
      });
      if (res.ok) setReminders(await res.json());
      else toast.error('Failed to load reminders');
    } catch {
      toast.error('Server error');
    }
  };

  const handleTimeChange = (i, val) => setTimes(times.map((t, idx) => (idx === i ? val : t)));
  const addTime = () => setTimes([...times, '']);
  const removeTime = (i) => times.length > 1 && setTimes(times.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicineName || !toEmail || !durationDays || times.some(t => !t)) return toast.error('Fill all fields');

    try {
      const res = await fetch(`${backendUrl}/api/reminder/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({ medicineName, times, toEmail, durationDays }),
      });
      const data = await res.json();
      res.ok
        ? (toast.success('Reminder added'), fetchReminders(), setMedicineName(''), setTimes(['']), setToEmail(''), setDurationDays(''))
        : toast.error(data.message || 'Failed');
    } catch {
      toast.error('Server error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/reminder/delete/${id}`, {
        method: 'DELETE', headers: { token },
      });
      if (res.ok) setReminders(reminders.filter(r => r._id !== id));
      else toast.error('Delete failed');
    } catch {
      toast.error('Server error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Medicine Reminder</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Medicine Name"
          value={medicineName}
          onChange={e => setMedicineName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
        />

        {times.map((t, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="time"
              value={t}
              onChange={e => handleTimeChange(i, e.target.value)}
              className="w-full sm:flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            />
            {times.length > 1 && (
              <button type="button" onClick={() => removeTime(i)} className="bg-red-500 text-white px-3 py-1 rounded w-full sm:w-auto">
                ✕
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addTime} className="bg-green-500 text-white px-3 py-1 rounded">+ Add Time</button>

        <input
          type="email"
          placeholder="Email"
          value={toEmail}
          onChange={e => setToEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="number"
          min="1"
          placeholder="Duration (Days)"
          value={durationDays}
          onChange={e => setDurationDays(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
        />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
          Schedule
        </button>
      </form>

      <div className="mt-12">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center">Scheduled Reminders</h3>
        {reminders.length === 0 ? (
          <p className="text-center text-gray-500">No reminders.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reminders.map(r => (
              <div key={r._id} className="border p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50">
                <div className="mb-2 sm:mb-0">
                  <p><strong>{r.medicineName}</strong></p>
                  <p className="text-sm text-gray-700">Times: {r.times.join(', ')}</p>
                  <p className="text-sm text-gray-700">Email: {r.toEmail}</p>
                  <p className="text-sm text-gray-700">Duration: {r.durationDays} day{r.durationDays>1?'s':''}</p>
                  <p className="text-sm text-gray-700">
  Created At: {dayjs(r.createdAt).format('DD MMM YYYY, HH:mm')}
</p>
                </div>
                <button onClick={() => handleDelete(r._id)} className="bg-red-500 text-white px-3 py-1 rounded w-full sm:w-auto mt-2 sm:mt-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicineReminder;
