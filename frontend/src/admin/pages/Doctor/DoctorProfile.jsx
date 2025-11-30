import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, setProfileData, updateProfile } = useContext(DoctorContext);
  const { backendUrl } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  useEffect(() => {
    if (profileData) {
      setEditData(profileData);
    }
  }, [profileData]);

  if (!profileData) return null;

  let addressLines = [];
  try {
    addressLines = JSON.parse(editData.address || "[]");
  } catch {
    addressLines = Array.isArray(editData.address) ? editData.address : [];
  }

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (index, value) => {
    const updatedAddress = [...addressLines];
    updatedAddress[index] = value;
    handleChange("address", JSON.stringify(updatedAddress));
  };

  // *** Updated handleSave to call updateProfile API ***
  const handleSave = async () => {
    try {
      await updateProfile(editData);  // Calls backend & updates context on success
      setIsEdit(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Optional: Show some UI feedback here
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
      {/* Profile Image */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <img
          src={editData.image}
          alt={editData.name}
          className="w-28 h-28 rounded-full object-cover border-2 border-blue-500"
        />
        <div className="text-center sm:text-left">
          {isEdit ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="text-2xl font-bold text-gray-900 border rounded p-1"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900">{editData.name}</h2>
          )}
          {isEdit ? (
            <input
              type="text"
              value={editData.degree}
              onChange={(e) => handleChange("degree", e.target.value)}
              className="text-base text-gray-600 mt-1 border rounded p-1"
            />
          ) : (
            <p className="text-base text-gray-600 mt-1">
              {editData.degree} - {editData.speciality}
            </p>
          )}
          {isEdit && (
            <input
              type="text"
              value={editData.speciality}
              onChange={(e) => handleChange("speciality", e.target.value)}
              className="text-base text-gray-600 mt-1 border rounded p-1"
            />
          )}
          {isEdit ? (
            <input
              type="text"
              value={editData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              className="mt-3 px-4 py-1 border rounded text-sm"
            />
          ) : (
            <button className="mt-3 px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">
              {editData.experience} years experience
            </button>
          )}
        </div>
      </div>

      {/* About */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800">About:</h3>
        {isEdit ? (
          <textarea
            value={editData.about}
            onChange={(e) => handleChange("about", e.target.value)}
            className="w-full border rounded p-2 text-base text-gray-700"
          />
        ) : (
          <p className="text-base text-gray-700 mt-2 leading-relaxed">{editData.about}</p>
        )}
      </div>

      {/* Fees */}
      <div className="mt-5">
        <p className="text-base text-gray-800 font-medium">
          Appointment Fee:{" "}
          {isEdit ? (
            <input
              type="number"
              value={editData.fees}
              onChange={(e) => handleChange("fees", e.target.value)}
              className="border rounded p-1 text-green-600"
            />
          ) : (
            <span className="text-green-600 font-semibold">₹{editData.fees}</span>
          )}
        </p>
      </div>

      {/* Address */}
      <div className="mt-5">
        <h3 className="text-lg font-semibold text-gray-800">Address:</h3>
        {isEdit
          ? addressLines.map((line, idx) => (
              <input
                key={idx}
                type="text"
                value={line}
                onChange={(e) => handleAddressChange(idx, e.target.value)}
                className="w-full border rounded p-1 mt-1"
              />
            ))
          : addressLines.map((line, idx) => (
              <p key={idx} className="text-base text-gray-700">{line}</p>
            ))}
      </div>

      {/* Availability */}
      <div className="mt-5 flex items-center gap-2">
        <input
          type="checkbox"
          checked={editData.available}
          disabled={!isEdit}
          onChange={(e) => handleChange("available", e.target.checked)}
          id="available"
          className="w-5 h-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
        />
        <label htmlFor="available" className="text-base text-gray-800">Available</label>
      </div>

      {/* Buttons */}
      <div className="mt-7 flex gap-3">
        {isEdit ? (
          <>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white text-base rounded-lg shadow hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEdit(false);
                setEditData(profileData);
              }}
              className="px-6 py-2 bg-gray-400 text-white text-base rounded-lg shadow hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="px-6 py-2 bg-blue-600 text-white text-base rounded-lg shadow hover:bg-blue-700 transition"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
