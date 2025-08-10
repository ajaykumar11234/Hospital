import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets_frontend/assets';
import { AppContext } from '../context/AppContextProvider';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { token, setToken } = useContext(AppContext);

  const logout = () => {
    setToken(''); // Correct way to clear token
    localStorage.removeItem('token');
    navigate('/'); // Redirect to home page
    setShowProfileMenu(false); // Close profile menu
  };

  const toggleProfileMenu = () => setShowProfileMenu(prev => !prev);
  const closeMenus = () => {
    setShowMenu(false);
    setShowProfileMenu(false);
  };

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
          <NavLink to='/' onClick={closeMenus}><li className='hover:text-primary'>Home</li></NavLink>
          <NavLink to='/doctors' onClick={closeMenus}><li className='hover:text-primary'>All Doctors</li></NavLink>
          <NavLink to='/about' onClick={closeMenus}><li className='hover:text-primary'>About</li></NavLink>
          <NavLink to='/contact' onClick={closeMenus}><li className='hover:text-primary'>Contact</li></NavLink>
        </ul>

        {/* Right Side */}
        <div className='flex items-center gap-4 relative'>
          {token ? (
            <div className='relative'>
              <div
                className='flex items-center gap-2 cursor-pointer'
                onClick={toggleProfileMenu}
              >
                <img className='w-8 rounded-full' src={assets.profile_pic} alt="profile" />
                <img className='w-2.5' src={assets.dropdown_icon} alt="dropdown" />
              </div>

              {showProfileMenu && (
                <div className='absolute top-12 right-0 bg-stone-100 rounded shadow-md p-4 z-30 min-w-[160px]'>
                  <p onClick={() => { navigate('/my-profile'); closeMenus(); }} className='hover:text-black cursor-pointer mb-2'>My Profile</p>
                  <p onClick={() => { navigate('/my-appointments'); closeMenus(); }} className='hover:text-black cursor-pointer mb-2'>My Appointments</p>
                  <p onClick={logout} className='hover:text-black cursor-pointer'>Logout</p>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => { navigate('/login'); closeMenus(); }} className='bg-primary text-white px-6 py-2 rounded-full font-light hidden md:block'>
              Create Account
            </button>
          )}

          {/* Hamburger Icon for Mobile */}
          <button className='md:hidden block' onClick={() => { setShowMenu(!showMenu); setShowProfileMenu(false); }}>
            <img src={assets.menu_icon} alt="menu" className='w-6 h-6' />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMenu && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white border-t border-gray-200 z-40 px-6 py-4 space-y-4 shadow-lg">
          <NavLink to='/' onClick={closeMenus} className="block text-gray-700">Home</NavLink>
          <NavLink to='/doctors' onClick={closeMenus} className="block text-gray-700">All Doctors</NavLink>
          <NavLink to='/about' onClick={closeMenus} className="block text-gray-700">About</NavLink>
          <NavLink to='/contact' onClick={closeMenus} className="block text-gray-700">Contact</NavLink>

          {!token && (
            <button onClick={() => { navigate('/login'); closeMenus(); }} className='w-full bg-primary text-white px-4 py-2 rounded-full mt-2'>
              Create Account
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;