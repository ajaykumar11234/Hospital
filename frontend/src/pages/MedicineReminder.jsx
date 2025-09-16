import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function MedicineReminder() {
  const [medicineName, setMedicineName] = useState('');
  const [times, setTimes] = useState(['']);
  const [toEmail, setToEmail] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [reminders, setReminders] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      toast.info('Please login.');
      navigate('/login');
      return;
    }
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/reminder/list', {
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
      const res = await fetch('http://localhost:4000/api/reminder/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({ medicineName, times, toEmail, durationDays }),
      });
      const data = await res.json();
      res.ok ? (toast.success('Reminder added'), fetchReminders(), setMedicineName(''), setTimes(['']), setToEmail(''), setDurationDays('')) 
             : toast.error(data.message || 'Failed');
    } catch {
      toast.error('Server error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/reminder/delete/${id}`, {
        method: 'DELETE', headers: { token },
      });
      if (res.ok) setReminders(reminders.filter(r => r._id !== id));
      else toast.error('Delete failed');
    } catch {
      toast.error('Server error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Medicine Reminder</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Medicine Name" value={medicineName} onChange={e => setMedicineName(e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
        {times.map((t, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="time" value={t} onChange={e => handleTimeChange(i, e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
            {times.length > 1 && <button type="button" onClick={() => removeTime(i)} className="bg-red-500 text-white px-2 rounded">✕</button>}
          </div>
        ))}
        <button type="button" onClick={addTime} className="bg-green-500 text-white px-3 py-1 rounded">+ Add Time</button>
        <input type="email" placeholder="Email" value={toEmail} onChange={e => setToEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
        <input type="number" min="1" placeholder="Duration (Days)" value={durationDays} onChange={e => setDurationDays(e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">Schedule</button>
      </form>

      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4 text-center">Scheduled Reminders</h3>
        {reminders.length === 0 ? <p className="text-center text-gray-500">No reminders.</p> :
          reminders.map(r => (
            <div key={r._id} className="border p-4 rounded-md flex justify-between items-center bg-gray-50">
              <div>
                <p><strong>{r.medicineName}</strong></p>
                <p>Times: {r.times.join(', ')}</p>
                <p>Email: {r.toEmail}</p>
                <p>Duration: {r.durationDays} day{r.durationDays>1?'s':''}</p>
              </div>
              <button onClick={() => handleDelete(r._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default MedicineReminder;
