import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || false);
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);   // ✅ added user for Navbar
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currencySymbol = '₹';

  const loadUserProfileData = useCallback(async () => {
    if (!token) {
      setUserData(null);
      setUser(null);
      return;
    }
    
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { token } 
      });

      if (data.success) {
        setUserData(data.userData);
        setUser(data.userData);   // ✅ keep Navbar synced
      } else {
        toast.error(data.message);
        setToken(false);
        localStorage.removeItem('token');
        setUserData(null);
        setUser(null);
      }
    } catch (error) {
      toast.error("Failed to load user profile");
      console.error(error);
      setToken(false);
      localStorage.removeItem('token');
      setUserData(null);
      setUser(null);
    }
  }, [backendUrl, token]);

  const getDoctorsData = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors data');
    }
  }, [backendUrl]);

  useEffect(() => {
    getDoctorsData();
  }, [getDoctorsData]);

  useEffect(() => {
    loadUserProfileData();
  }, [token, loadUserProfileData]);

  const updateToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  const value = { 
    doctors, 
    getDoctorsData,
    currencySymbol,
    token,
    setToken: updateToken,
    backendUrl,
    userData,
    setUserData,
    user,          // ✅ now Navbar can access backend profile
    setUser,       // ✅ allow manual update if needed
    loadUserProfileData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
