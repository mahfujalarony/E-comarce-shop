import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccountCircle } from "react-icons/md";
import { useAuth } from '../auth/AuthContext';

const menuItems = ['Home', 'Contact', 'About', 'Sign Up'] as const;

const Navbar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [avatarOpen, setAvatarOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { authData } = useAuth();

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 1024);
    if (window.innerWidth >= 1024) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : 'auto';
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setSidebarOpen((prev) => !prev);
  }, [isMobile]);

  const handleMenuSelect = useCallback((item: string) => {
    setActiveMenu(item);
    if (isMobile) setSidebarOpen(false);
    const path = item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '')}`;
    navigate(path);
  }, [isMobile, navigate]);

  const toggleAvatar = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarOpen((prev) => !prev);
  }, []);

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const avatarMenu = document.getElementById("avatar-menu");
    if (avatarMenu && !avatarMenu.contains(target)) {
      setAvatarOpen(false);
    }
  }, []);

  const handleDropdownItemClick = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarOpen(false);
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [handleOutsideClick]);

  return (
    <div className="font-inter mb-24">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-4 sm:px-10 xl:px-32 h-20 flex justify-between items-center">
        {/* Logo/Menu Button */}
        <div className="relative">
          <button
            type="button"
            className="font-bold text-2xl cursor-pointer hover:text-red-500 transition-colors duration-300"
            onClick={toggleSidebar}
          >
            Exclusive
          </button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex">
          <ul className="flex text-xl text-[#808080] space-x-5 xl:space-x-10">
            {menuItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => handleMenuSelect(item)}
                  className={`pb-2 transition-all hover:text-black hover:font-semibold ${
                    activeMenu === item ? 'text-black font-semibold' : ''
                  }`}
                >
                  {item}
                  {activeMenu === item && (
                    <div className="w-full h-[3px] bg-red-500 rounded-full mt-1" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Icons */}
        <div className="flex gap-3 sm:gap-5 items-center">
          <div className="relative w-full max-w-[180px] sm:max-w-sm hidden sm:block hover:shadow-md transition-shadow duration-300">
            <input
              type="search"
              placeholder="What are you looking for?"
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors duration-300"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              🔍
            </span>
          </div>

          <button type="button" className="p-1">
            <img 
              src="/figma/Vector.svg" 
              alt="Wishlist" 
              className="w-6 h-6 hover:scale-110 transition-transform" 
            />
          </button>

          <button type="button" className="p-1">
            <img 
              src="/figma/Cart1.svg" 
              alt="Cart" 
              className="w-6 h-6 hover:scale-110 transition-transform" 
            />
          </button>

          {/* Avatar Dropdown */}
          <div className="relative" id="avatar-menu">
            <button 
              type="button" 
              onClick={toggleAvatar}
              className="focus:outline-none"
              aria-label="User menu"
            >
              {authData?.imgUrl ? (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all">
                  <img 
                    src={authData.imgUrl} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <MdAccountCircle className="text-4xl md:text-5xl cursor-pointer text-gray-400 hover:text-blue-600 transition-colors" />
              )}
            </button>
            
            {avatarOpen && (
              <ul className="absolute top-14 right-0 bg-white border rounded-md shadow-lg w-48 z-50 text-sm text-gray-700 overflow-hidden">
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors" 
                  onClick={(e) => handleDropdownItemClick("/account", e)}
                >
                  Manage My Account
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={(e) => handleDropdownItemClick("/orders", e)}
                >
                  My Orders
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={(e) => handleDropdownItemClick("/wishlist", e)}
                >
                  My Wishlist
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={(e) => handleDropdownItemClick("/payment-methods", e)}
                >
                  Payment Methods
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={(e) => handleDropdownItemClick("/returns", e)}
                >
                  Order Returns & Refunds
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={(e) => handleDropdownItemClick("/refer", e)}
                >
                  Refer a Friend
                </li>
                <li 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={(e) => handleDropdownItemClick("/support", e)}
                >
                  Help / Support Center
                </li>
                <li className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer transition-colors">
                  Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Mobile */}
      <nav
        className={`fixed top-0 left-0 w-64 h-full bg-white p-5 z-50 transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden`}
        aria-hidden={!sidebarOpen}
      >
        <ul className="flex flex-col text-xl text-[#808080] space-y-5 mt-20">
          {menuItems.map((item) => (
            <li key={item}>
              <button
                type="button"
                className={`w-full text-left pb-2 hover:text-black hover:font-semibold transition-all ${
                  activeMenu === item ? 'text-black font-semibold' : ''
                }`}
                onClick={() => handleMenuSelect(item)}
              >
                {item}
                {activeMenu === item && (
                  <div className="w-full h-[3px] bg-red-500 rounded-full mt-1" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;