import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify'; // ✅ No ToastContainer needed here
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAToken, backendUrl } = useContext(AdminContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, { email, password });

        if (data.success) {
          localStorage.setItem('aToken', data.atoken);
          setAToken(data.atoken);
          toast.success('Login successful!');
          navigate('/admin-dashboard');
        } else {
          toast.error(data.message || 'Login failed');
        }
      } else {
        // TODO: Doctor login logic
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

          <div className="text-center text-sm text-gray-600">
            {state === 'Admin' ? (
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
            ) : (
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
