import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  Pill,
  Clock,
  Mail,
  Trash2,
  Plus,
  Calendar,
  CheckCircle,
  Activity,
  User,
} from "lucide-react";

function MedicineReminder() {
  const [medicineName, setMedicineName] = useState("");
  const [times, setTimes] = useState([""]);
  const [toEmail, setToEmail] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔑 Auth & API setup
  const token = localStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!token) {
      toast.info("Please login first.");
      return;
    }
    fetchReminders();
  }, [token]);

  // 🔹 Fetch reminders
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/reminder/list`, {
        headers: { token },
      });
      if (res.ok) {
        setReminders(await res.json());
      } else {
        toast.error("Failed to load reminders");
      }
    } catch (error) {
      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle add reminder
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicineName || !toEmail || !durationDays || times.some((t) => !t)) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/reminder/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({
          medicineName,
          times,
          toEmail,
          durationDays,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Medication reminder scheduled successfully");
        fetchReminders();
        // Reset form
        setMedicineName("");
        setTimes([""]);
        setToEmail("");
        setDurationDays("");
      } else {
        toast.error(data.message || "Failed to add reminder");
      }
    } catch (error) {
      toast.error("System error occurred");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle delete reminder
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medication reminder?")) {
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/reminder/delete/${id}`, {
        method: "DELETE",
        headers: { token },
      });
      if (res.ok) {
        setReminders(reminders.filter((r) => r._id !== id));
        toast.success("Medication reminder deleted");
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      toast.error("Failed to delete reminder");
    }
  };

  // 🔹 Progress calculation
  const getProgress = (createdAt, durationDays) => {
    const start = dayjs(createdAt);
    const end = start.add(durationDays, "day");
    const today = dayjs();

    const total = end.diff(start, "day");
    const passed = today.diff(start, "day");

    const percent = Math.min(Math.max((passed / total) * 100, 0), 100);
    const daysLeft = Math.max(total - passed, 0);

    return { percent, daysLeft, isExpired: daysLeft === 0 && percent >= 100 };
  };

  const getStatusColor = (progress) => {
    if (progress.isExpired) return "bg-gray-500";
    if (progress.daysLeft <= 3) return "bg-red-500";
    if (progress.daysLeft <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = (progress) => {
    if (progress.isExpired) return "Completed";
    if (progress.daysLeft <= 3) return "Ending Soon";
    return "Active";
  };

  const handleTimeChange = (i, val) =>
    setTimes(times.map((t, idx) => (idx === i ? val : t)));

  const addTime = () => setTimes([...times, ""]);
  const removeTime = (i) =>
    times.length > 1 && setTimes(times.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Pill className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Medication Management
                </h1>
                <p className="text-gray-600">Schedule and track medication reminders</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>Real-time Monitoring</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-blue-600" />
                  New Medication Reminder
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Medicine Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter medication name"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>

                {/* Administration Times */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Administration Times *
                  </label>
                  <div className="space-y-3">
                    {times.map((time, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(i, e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            required
                          />
                        </div>
                        {times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTime(i)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove time"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addTime}
                    className="mt-2 flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Another Time
                  </button>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Duration (Days) *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="30"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Maximum 365 days</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  Schedule Reminder
                </button>
              </form>
            </div>
          </div>

          {/* Reminders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Active Medication Reminders
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {reminders.length} Total
                  </span>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-3 text-gray-600">Loading reminders...</span>
                  </div>
                ) : reminders.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Reminders</h3>
                    <p className="text-gray-500">Schedule your first medication reminder to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reminders.map((reminder) => {
                      const progress = getProgress(reminder.createdAt, reminder.durationDays);
                      const statusColor = getStatusColor(progress);
                      const statusText = getStatusText(progress);

                      return (
                        <div
                          key={reminder._id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-50 p-2 rounded-lg">
                                <Pill className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {reminder.medicineName}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {reminder.times.join(", ")}
                                  </span>
                                  <span className="flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    {reminder.toEmail}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusColor}`}
                              >
                                {statusText}
                              </span>
                              <button
                                onClick={() => handleDelete(reminder._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete reminder"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Progress Section */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Treatment Progress</span>
                              <span className="font-medium text-gray-900">
                                {progress.isExpired
                                  ? "Completed"
                                  : `${progress.daysLeft} days remaining`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${statusColor}`}
                                style={{ width: `${progress.percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                Started: {dayjs(reminder.createdAt).format("MMM D, YYYY")}
                              </span>
                              <span>{Math.round(progress.percent)}% complete</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineReminder;
