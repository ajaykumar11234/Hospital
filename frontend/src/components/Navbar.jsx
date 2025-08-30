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

  // ✅ Close menus if clicked outside
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

  // ✅ Helper for active NavLink styling
  const linkClass = ({ isActive }) =>
    isActive ? "text-primary font-semibold" : "hover:text-primary";

  return (
    <div className="relative border-b border-gray-300 px-4 sm:px-[8%] py-4">
      <div className='flex items-center justify-between text-sm'>
        {/* Logo */}
        <img
          onClick={() => { navigate("/"); closeMenus(); }}
          src={assets.logo}
          alt="logo"
          className="h-14 w-auto cursor-pointer"
        />

        {/* Desktop Menu */}
        <ul className='hidden md:flex items-start gap-6 font-medium text-gray-700'>
          <NavLink to='/' className={linkClass} onClick={closeMenus}>Home</NavLink>
          <NavLink to='/check-disease' className={linkClass} onClick={closeMenus}>Check-Disease</NavLink>
          {/* <NavLink to='/chat/:' className={linkClass} onClick={closeMenus}>Chat-With-Doctor</NavLink> */}
          <NavLink to='/chatbot' className={linkClass} onClick={closeMenus}>Chat-Bot</NavLink>
          <NavLink to='/doctors' className={linkClass} onClick={closeMenus}>All Doctors</NavLink>
          <NavLink to='/about' className={linkClass} onClick={closeMenus}>About</NavLink>
          <NavLink to='/contact' className={linkClass} onClick={closeMenus}>Contact</NavLink>
        </ul>

        {/* Right Side */}
        <div className='flex items-center gap-4 relative'>
          {token ? (
            <div className='relative' ref={profileRef}>
              <button
                className='flex items-center gap-2 cursor-pointer'
                onClick={toggleProfileMenu}
                aria-label="Profile Menu"
              >
                <img
                  className='w-8 h-8 rounded-full object-cover'
                  src={user?.image || assets.profile_pic}
                  alt="profile"
                />
                <img className='w-2.5' src={assets.dropdown_icon} alt="dropdown" />
              </button>

              {showProfileMenu && (
                <div className='absolute top-12 right-0 bg-stone-100 rounded shadow-md p-4 z-30 min-w-[160px]'>
                  <p onClick={() => { navigate('/my-profile'); closeMenus(); }} className='hover:text-black cursor-pointer mb-2'>My Profile</p>
                  <p onClick={() => { navigate('/my-appointments'); closeMenus(); }} className='hover:text-black cursor-pointer mb-2'>My Appointments</p>
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
      {showMenu && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-[100%] left-0 w-full bg-white border-t border-gray-200 z-40 px-6 py-4 space-y-4 shadow-lg"
        >
          <NavLink to='/' className={linkClass} onClick={closeMenus}>Home</NavLink>
          <NavLink to='/check-disease' className={linkClass} onClick={closeMenus}>Check-Disease</NavLink>
          <NavLink to='/chatbot' className={linkClass} onClick={closeMenus}>Chat-Bot</NavLink>
          <NavLink to='/doctors' className={linkClass} onClick={closeMenus}>All Doctors</NavLink>
          <NavLink to='/about' className={linkClass} onClick={closeMenus}>About</NavLink>
          <NavLink to='/contact' className={linkClass} onClick={closeMenus}>Contact</NavLink>

          {!token && (
            <button
              onClick={() => { navigate('/login'); closeMenus(); }}
              className='w-full bg-primary text-white px-4 py-2 rounded-full mt-2'
            >
              Login
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
