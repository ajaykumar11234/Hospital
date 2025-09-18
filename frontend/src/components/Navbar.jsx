import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets_frontend/assets';
import { AppContext } from '../context/AppContextProvider';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { token, setToken, user, setUser } = useContext(AppContext);

  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => setShowProfileMenu(prev => !prev);
  const closeMenus = () => {
    setShowMenu(false);
    setShowProfileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        profileRef.current && !profileRef.current.contains(e.target)
      ) {
        closeMenus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    isActive ? "text-primary font-semibold" : "hover:text-primary";

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/check-disease', label: 'Check-Disease' },
    { to: '/chatbot', label: 'Chat-Bot' },
    { to: '/reminder', label: 'Reminder' },
    { to: '/doctors', label: 'All Doctors' },
    { to: '/live-chat', label: 'Live Chat' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/buy-medicine', label: 'Buy Medicine' },
  ];

  return (
    <nav className="relative border-b border-gray-300 px-4 sm:px-[8%] py-4 bg-white">
      <div className='flex items-center justify-between'>
        {/* Logo */}
        <img
          onClick={() => { navigate("/"); closeMenus(); }}
          src={assets.logo}
          alt="logo"
          className="h-14 w-auto cursor-pointer"
        />

        {/* Desktop Menu */}
        <ul className='hidden md:flex items-center gap-6 font-medium text-gray-700'>
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={closeMenus}>
              {link.label}
            </NavLink>
          ))}
        </ul>

        {/* Right Side */}
        <div className='flex items-center gap-4 relative'>
          {token ? (
            <div className='relative' ref={profileRef}>
              <button
                className='flex items-center gap-2 cursor-pointer'
                onClick={toggleProfileMenu}
              >
                <img
                  className='w-8 h-8 rounded-full object-cover'
                  src={user?.image || assets.person}
                  alt="profile"
                />
                <img className='w-2.5' src={assets.dropdown_icon} alt="dropdown" />
              </button>

              {showProfileMenu && (
                <div className='absolute top-12 right-0 bg-white rounded shadow-md p-4 z-30 min-w-[160px]'>
                  <p onClick={() => { navigate('/my-profile'); closeMenus(); }} className='hover:text-black cursor-pointer mb-2'>My Profile</p>
                  <p onClick={() => { navigate('/my-appointments'); closeMenus(); }} className='hover:text-black cursor-pointer mb-2'>My Appointments</p>
                  <p onClick={() => { navigate('/my-orders'); closeMenus(); }} className='hover:text-black cursor-pointer mb-2'>My Orders</p>
                  <p onClick={logout} className='hover:text-black cursor-pointer'>Logout</p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { navigate('/login'); closeMenus(); }}
              className='bg-primary text-white px-6 py-2 rounded-full font-light hidden md:block'
            >
              Login
            </button>
          )}

          {/* Hamburger Icon for Mobile */}
          <button
            className='md:hidden block'
            onClick={() => { setShowMenu(!showMenu); setShowProfileMenu(false); }}
            aria-label="Menu"
          >
            <img src={assets.menu_icon} alt="menu" className='w-6 h-6' />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {/* Mobile Menu Dropdown */}
{showMenu && (
  <div
    ref={menuRef}
    className="md:hidden absolute top-full right-0 w-56 bg-white border border-gray-200 z-40 px-4 py-4 shadow-lg rounded-md"
  >
    <ul className="flex flex-col gap-4">
      {navLinks.map(link => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            className={({ isActive }) => isActive ? "text-primary font-semibold block" : "hover:text-primary block"}
            onClick={closeMenus}
          >
            {link.label}
          </NavLink>
        </li>
      ))}
      {!token && (
        <li>
          <button
            onClick={() => { navigate('/login'); closeMenus(); }}
            className='w-full bg-primary text-white px-4 py-2 rounded-full mt-2'
          >
            Login
          </button>
        </li>
      )}
    </ul>
  </div>
)}

    </nav>
  );
};

export default Navbar;
