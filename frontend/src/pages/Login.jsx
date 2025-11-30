import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '../context/AppContextProvider';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setToken: setAppToken } = useContext(AppContext);
  const { token: authToken, setToken: setAuthToken, role, setRole } = useContext(AuthContext);
  const [state, setState] = useState('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, { 
          name, 
          password, 
          email 
        });

        if (data.success) {
          setAuthToken(data.token);
          setAppToken(data.token);
          setRole('user');
          toast.success('Registration successful!');
          navigate('/home');
        } else {
          toast.error(data.message);
        }
      } else {
        console.log(`${backendUrl}`);
        let data;
        if (selectedRole === 'user') {
          ({ data } = await axios.post(`${backendUrl}/api/user/login`, { password, email }));
          if (data.success) {
            setAuthToken(data.token);
            setAppToken(data.token);
            setRole('user');
            toast.success('Login successful!');
            navigate('/home');
          } else toast.error(data.message);
        } else if (selectedRole === 'doctor') {
          ({ data } = await axios.post(`${backendUrl}/api/doctor/login`, { password, email }));
          if (data.success) {
            setAuthToken(data.token);
            setRole('doctor');
            localStorage.setItem('dToken', data.token);
            toast.success('Doctor login successful!');
            navigate('/doctor');
          } else toast.error(data.message);
        } else if (selectedRole === 'admin') {
          ({ data } = await axios.post(`${backendUrl}/api/admin/login`, { password, email }));
          if (data.success) {
            setAuthToken(data.atoken);
            localStorage.setItem('aToken', data.atoken);
            setRole('admin');
            toast.success('Admin login successful!');
            navigate('/admin');
          } else toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred');
    }
  };

  const toggleState = () => {
    setState(prevState => prevState === 'Login' ? 'Sign Up' : 'Login');
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          {state === 'Login' ? 'Login' : 'Sign Up'}
        </h2>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          {state === 'Login' 
            ? 'Welcome back! Please login to continue' 
            : 'Create a new account to get started'}
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-4">
  {state === 'Sign Up' && (
    <div>
      <label className="block text-sm font-medium text-gray-700">Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your name"
        required
      />
    </div>
  )}

  <div>
    <label className="block text-sm font-medium text-gray-700">Email</label>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter your email"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">Password</label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your password"
        required
        minLength="6"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  </div>

  {state === 'Login' && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Login as:</label>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="user">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  )}

  <button
    type="submit"
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-200"
  >
    {state === 'Login' ? 'Login' : 'Sign Up'}
  </button>
</form>


        <p className="mt-4 text-sm text-center text-gray-600">
          {state === 'Login' 
            ? "Don't have an account? "
            : "Already have an account? "}
          <button 
            onClick={toggleState}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            {state === 'Login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;