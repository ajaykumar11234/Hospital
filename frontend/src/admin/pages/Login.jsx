import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [state, setState] = useState('Admin'); // Admin | Doctor | User
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, { email, password });
        if (data.success) {
          localStorage.setItem('aToken', data.atoken);
          setAToken(data.atoken);
          toast.success('Admin login successful!');
          navigate('/admin-dashboard');
        } else toast.error(data.message || 'Login failed');
      } else if (state === 'Doctor') {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, { email, password });
        if (data.success) {
          localStorage.setItem('dToken', data.token);
          setDToken(data.token);
          toast.success('Doctor login successful!');
          navigate('/doctor-dashboard');
        } else toast.error(data.message || 'Login failed');
      } else if (state === 'User') {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, { email, password });
        if (data.success) {
          localStorage.setItem('uToken', data.token);
          toast.success('User login successful!');
          navigate('/user-dashboard');
        } else toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={onSubmitHandler} className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            <span className="text-blue-600">{state}</span> Login
          </h1>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              value={email}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              value={password}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>

          {/* Toggle between Admin / Doctor / User */}
          <div className="text-center text-sm text-gray-600">
            {state !== 'Admin' && (
              <p>
                Admin Login?{' '}
                <span
                  onClick={() => {
                    setState('Admin');
                    setEmail('');
                    setPassword('');
                  }}
                  className="text-blue-600 cursor-pointer hover:underline"
                >
                  Click here
                </span>
              </p>
            )}
            {state !== 'Doctor' && (
              <p>
                Doctor Login?{' '}
                <span
                  onClick={() => {
                    setState('Doctor');
                    setEmail('');
                    setPassword('');
                  }}
                  className="text-blue-600 cursor-pointer hover:underline"
                >
                  Click here
                </span>
              </p>
            )}
            {state !== 'User' && (
              <p>
                User Login?{' '}
                <span
                  onClick={() => {
                    window.location.replace("https://virtual-health-assistant-app.onrender.com/login");
                  }}
                  className="text-blue-600 cursor-pointer hover:underline"
                >
                  Click here
                </span>
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
