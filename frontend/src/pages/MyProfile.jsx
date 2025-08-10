import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContextProvider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const MyProfile = () => {
  const { userData, setUserData, backendUrl, token, loadUserProfileData } =
    useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: {},
    gender: "",
    dob: "",
    image: ""
  });
  const [imageFile, setImageFile] = useState(null);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      formData.append('address', JSON.stringify(profile.address));
      formData.append('gender', profile.gender);
      formData.append('dob', profile.dob);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        formData,
        { 
          headers: { 
            token
          }
        }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEditing(false);
        setImageFile(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || error.message || "Failed to update profile");
    }
  };

  useEffect(() => {
    if (userData) {
      setProfile(userData);
    }
  }, [userData]);

  useEffect(() => {
    return () => {
      if (profile.image && profile.image.startsWith('blob:')) {
        URL.revokeObjectURL(profile.image);
      }
    };
  }, [profile.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (JPEG, PNG)');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, image: imageUrl }));
    setImageFile(file);
  };

  const formatAddress = (address) => {
    if (typeof address === "object" && address !== null) {
      return `${address.line1 || ""}, ${address.line2 || ""}`;
    }
    return address || "";
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {!isEditing ? (
        // ==================== VIEW MODE ====================
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={profile.image || "/default-profile.png"}
              alt="Profile"
              className="w-24 h-24 rounded-lg object-cover"
            />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {profile.name}
          </h2>
          <hr className="mb-4" />

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Contact Information
            </h3>
            <p className="text-sm">
              <span className="font-medium">Email:</span>{" "}
              <a href={`mailto:${profile.email}`} className="text-blue-500">
                {profile.email}
              </a>
            </p>

            <p className="text-sm mt-2">
              <span className="font-medium">Phone:</span>{" "}
              <a href={`tel:${profile.phone}`} className="text-blue-500">
                {profile.phone}
              </a>
            </p>

            <p className="text-sm mt-2">
              <span className="font-medium">Address:</span>{" "}
              {formatAddress(profile.address)}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Basic Information
            </h3>
            <p className="text-sm">
              <span className="font-medium">Gender:</span> {profile.gender}
            </p>

            <p className="text-sm mt-2">
              <span className="font-medium">DOB:</span>{" "}
              {profile.dob
                ? new Date(profile.dob).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        // ==================== EDIT MODE ====================
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center space-x-4 mb-4">
            <label htmlFor="profile-photo" className="cursor-pointer">
              <img
                src={profile.image || "/default-profile.png"}
                alt="Profile"
                className="w-24 h-24 rounded-lg object-cover"
              />
              <span className="block text-xs text-center text-blue-500 mt-1">
                Click to change
              </span>
              <input
                type="file"
                id="profile-photo"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          <input
            type="text"
            name="name"
            value={profile.name || ""}
            onChange={handleChange}
            className="text-xl font-semibold text-gray-900 mb-4 w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Full Name"
          />
          <hr className="mb-4" />

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Contact Information
            </h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formatAddress(profile.address)}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                rows="3"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Basic Information
            </h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={profile.gender || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={profile.dob || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setProfile(userData);
                setIsEditing(false);
                setImageFile(null);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={updateUserProfileData}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;