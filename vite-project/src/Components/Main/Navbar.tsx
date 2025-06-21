import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccountCircle } from "react-icons/md";
import { useAuth } from '../auth/AuthContext';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ChatIcon from '@mui/icons-material/Chat';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';
import socket from '../../socket';

interface ConversationType {
  id: string;
  name: string;
  user: {
    name: string;
    email: string;
    imgUrl: string;
    role: 'admin' | 'user';
    userId: string;
  };
}

const menuItems = ['Home', 'Contact', 'About', 'Sign Up'] as const;

// কাস্টম স্টাইলড Autocomplete
const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    padding: '0.25rem 0.75rem',
    fontSize: '0.875rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
      padding: '0.2rem 0.5rem',
    },
    '&:hover': {
      borderColor: '#3b82f6',
    },
    '&.Mui-focused': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#6b7280',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
    },
  },
}));

const Navbar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [conversation, setSelectedConversation] = useState<ConversationType | null>(null);
  console.log('conversation', conversation);
  const [avatarOpen, setAvatarOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { authData } = useAuth();

  const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'software', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'Pulp Fiction', year: 1994 },
    { title: 'Inception', year: 2010 },
  ];

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

  const toggleAvatar = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
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

  const handleDropdownItemClick = useCallback((path: string, e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    setAvatarOpen(false);
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [handleOutsideClick]);

  const handleFirstChatLoaded = useCallback((conversation: ConversationType | null) => {
    if (conversation) {
      setSelectedConversation(conversation);
      navigate(`/messages/${conversation.id}`, {
        state: { user: conversation.user, name: conversation.name },
      });
    }
  }, [navigate]);

  useEffect(() => {
    socket.on('first_chat_loaded', handleFirstChatLoaded);
    return () => {
      socket.off('first_chat_loaded', handleFirstChatLoaded);
    };
  }, [handleFirstChatLoaded]);

  const handleClick = useCallback(() => {
    socket.emit('load_first_chat');
  }, []);

  return (
    <div className="font-inter mb-24">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-4 sm:px-6 md:px-10 xl:px-32 h-20 flex justify-between items-center">
        {/* Logo/Menu Button */}
        <div className="relative">
          <button
            type="button"
            className="font-bold text-xl sm:text-2xl cursor-pointer hover:text-red-500 transition-colors duration-300"
            onClick={toggleSidebar}
          >
            Exclusive
          </button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex">
          <ul className="flex text-base md:text-lg text-[#808080] space-x-4 xl:space-x-8">
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
        <div className="flex gap-2 sm:gap-4 items-center">
          {/* Search Bar */}
          <Stack spacing={2} sx={{ width: { xs: 150, sm: 200, md: 250 } }}>
            <StyledAutocomplete
              freeSolo
              id="free-solo-2-demo"
              disableClearable
              options={top100Films.map((option) => option.title)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search..."
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      type: 'search',
                    },
                  }}
                />
              )}
            />
          </Stack>

          {/* Message Icon */}
          <button type="button" onClick={handleClick} className="relative">
            <ChatIcon fontSize={isMobile ? 'medium' : 'large'} />
          </button>

          {/* Cart Icon */}
          <button type="button" onClick={() => navigate('/wishlist')} className="">
            <ShoppingCartCheckoutIcon fontSize={isMobile ? 'medium' : 'large'} />
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all">
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
                <MdAccountCircle className="text-3xl sm:text-4xl md:text-5xl cursor-pointer text-gray-400 hover:text-blue-600 transition-colors" />
              )}
            </button>
            
            {avatarOpen && (
              <ul className="absolute top-12 sm:top-14 right-0 bg-white border rounded-md shadow-lg w-48 z-50 text-sm text-gray-700 overflow-hidden">
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
                <li 
                  className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer transition-colors"
                  onClick={(e) => handleDropdownItemClick("/logout", e)}
                >
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
        <ul className="flex flex-col text-lg text-[#808080] space-y-5 mt-20">
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