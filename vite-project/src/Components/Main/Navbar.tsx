import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccountCircle, MdSearch, MdMenu, MdClose } from "react-icons/md";
import { useAuth } from '../auth/AuthContext';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ChatIcon from '@mui/icons-material/Chat';
//import NotificationsIcon from '@mui/icons-material/Notifications';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';
import socket from '../../socket';
import { toast } from 'react-toastify';

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

//const menuItems = ['Home', 'Contact', 'About', 'Sign Up'] as const;
const baseMenuItems = ['Home', 'Contact', 'About', 'Sign Up'] as const;

// Enhanced Styled Autocomplete
const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    padding: '8px 12px',
    fontSize: '0.875rem',
    background: '#ffffff',
    transition: 'all 0.3s ease',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
      padding: '6px 10px',
      borderRadius: '10px',
    },
    '&:hover': {
      borderColor: '#3b82f6',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
    },
    '&.Mui-focused': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      background: '#ffffff',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
    },
    '&.Mui-focused': {
      color: '#3b82f6',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const Navbar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  //const [conversation, setSelectedConversation] = useState<ConversationType | null>(null);
  const [avatarOpen, setAvatarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const token = localStorage.getItem('token');
  const menuItems = token ? baseMenuItems.filter(item => item !== 'Sign Up') : baseMenuItems;

  const navigate = useNavigate();
  const { authData, logout } = useAuth();

  const searchSuggestions = [
    { title: 'iPhone 15 Pro Max', category: 'Electronics' },
    { title: 'Samsung Galaxy S24', category: 'Electronics' },
    { title: 'MacBook Air M3', category: 'Laptops' },
    { title: 'Nike Air Force 1', category: 'Shoes' },
    { title: 'Adidas Ultraboost', category: 'Shoes' },
    { title: 'Cotton T-Shirt', category: 'Clothing' },
    { title: 'Wireless Headphones', category: 'Electronics' },
    { title: 'Gaming Chair', category: 'Furniture' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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


    const handleLogout = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    setAvatarOpen(false);
    logout();
    navigate('/');
  }, [logout, navigate]);


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
      // setSelectedConversation(conversation); // এই লাইন সরিয়ে দিন
      navigate(`/messages/${conversation.id}`, {
        state: { user: conversation.user, name: conversation.name },
      });
    } else {
      toast.info('No active conversation found');
    }
  }, [navigate]);

  useEffect(() => {
    socket.on('first_chat_loaded', handleFirstChatLoaded);
    return () => {
      socket.off('first_chat_loaded', handleFirstChatLoaded);
    };
  }, [handleFirstChatLoaded]);

const handleChatClick = useCallback(() => {
  if (!token) {
    toast.info('Please login to access messages');
    return;
  }
  socket.emit('load_first_chat');
}, [token]);

  // শুধু keyword পাঠানোর জন্য handleSearch ও Autocomplete onChange
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  }, [navigate, searchQuery]);

  return (
    <div className="font-inter ">
      {/* Sticky Navbar with Glass Effect */}
      <header className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white shadow-md'
      }`}>
        <div className="px-4 sm:px-6 md:px-10 xl:px-32 h-20 flex justify-between items-center">
          {/* Logo/Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <MdClose className="text-2xl text-gray-700" />
              ) : (
                <MdMenu className="text-2xl text-gray-700" />
              )}
            </button>

            {/* Logo */}
            <button
              type="button"
              className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => navigate('/')}
            >
              Exclusive
            </button>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex">
            <ul className="flex text-base md:text-lg text-gray-600 space-x-8">
              {menuItems.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => handleMenuSelect(item)}
                    className={`relative pb-2 px-2 transition-all duration-300 hover:text-blue-600 group ${
                      activeMenu === item ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {item}
                    <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ${
                      activeMenu === item ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover:opacity-50 group-hover:scale-100'
                    }`} />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Bar */}
            <div className="hidden sm:block">
              <Stack spacing={2} sx={{ width: { sm: 200, md: 280, lg: 320 } }}>
                  <StyledAutocomplete
    freeSolo
    disableClearable
    options={searchSuggestions.map((option) => option.title)}
    inputValue={searchQuery}
    onInputChange={(_, newInputValue, reason) => {
      if (reason !== 'reset') {
        setSearchQuery(newInputValue);
      }
    }}
    onChange={(_, value) => {
      // value string | null হতে পারে, তাই string নিশ্চিত করুন
      const searchValue = typeof value === 'string' ? value : '';
      setSearchQuery(searchValue);
      if (searchValue) {
        navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      }
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Search products..."
        size="small"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
          }
        }}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <button
              onClick={handleSearch}
              className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <MdSearch className="text-xl text-blue-600" />
            </button>
          ),
        }}
      />
    )}
  />
              </Stack>
            </div>

            {/* Mobile Search Button */}
            <button 
              className="sm:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => navigate('/search')}
            >
              <MdSearch className="text-xl text-gray-600" />
            </button>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
             
 


              {/* Messages */}
              <button 
                type="button" 
                onClick={handleChatClick} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative group"
                title="Messages"
              >
                <ChatIcon className="text-gray-600 group-hover:text-blue-600 transition-colors" fontSize={isMobile ? 'medium' : 'large'} />
              </button>

              {/* Cart */}
              <button 
                type="button" 
                onClick={() => navigate('/wishlist')} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative group"
                title="Shopping Cart"
              >
                <ShoppingCartCheckoutIcon className="text-gray-600 group-hover:text-blue-600 transition-colors" fontSize={isMobile ? 'medium' : 'large'} />
              </button>
            </div>

            {/* Avatar Dropdown */}
            <div className="relative" id="avatar-menu">
              <button 
                type="button" 
                onClick={toggleAvatar}
                className="focus:outline-none hover:scale-105 transition-transform duration-200"
                aria-label="User menu"
              >
                {authData?.imgUrl ? (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 shadow-md">
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
                  <MdAccountCircle className="text-4xl sm:text-5xl cursor-pointer text-gray-400 hover:text-blue-600 transition-colors" />
                )}
              </button>
              
              {/* Enhanced Dropdown Menu */}
              {avatarOpen && (
                <div className="absolute top-14 sm:top-16 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl w-64 z-50 overflow-hidden">
                  {/* User Info Header */}
                  {authData && (
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 truncate">{authData.name || 'User'}</p>
                      <p className="text-sm text-gray-600 truncate">{authData.email}</p>
                    </div>
                  )}
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    {[
                      { label: 'Manage My Account', path: '/account', icon: '👤' },
                      { label: 'My Orders', path: '/orders', icon: '📦' },
                      { label: 'My Wishlist', path: '/wishlist', icon: '❤️' },
                      { label: 'Payment Methods', path: '/payment-methods', icon: '💳' },
                      { label: 'Order Returns & Refunds', path: '/returns', icon: '↩️' },
                      { label: 'Refer a Friend', path: '/refer', icon: '🎁' },
                      { label: 'Help / Support Center', path: '/support', icon: '❓' },
                    ].map((item, index) => (
                      <li 
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3 text-gray-700 hover:text-blue-600" 
                        onClick={(e) => handleDropdownItemClick(item.path, e)}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </li>
                    ))}
                    
                    {/* Logout */}
  <li 
    className="px-4 py-3 hover:bg-red-50 text-red-600 cursor-pointer transition-colors flex items-center space-x-3 border-t border-gray-100 mt-2"
    onClick={handleLogout}
  >
    <span className="text-lg">🚪</span>
    <span className="text-sm font-medium">Logout</span>
  </li>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Enhanced Mobile Sidebar */}
      <nav
        className={`fixed top-0 left-0 w-80 h-full bg-white z-50 transition-transform duration-300 ease-in-out transform shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden`}
        aria-hidden={!sidebarOpen}
      >
        {/* Sidebar Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Menu</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>
          {authData && (
            <div className="mt-4 flex items-center space-x-3">
              {authData.imgUrl ? (
                <img 
                  src={authData.imgUrl} 
                  alt="User" 
                  className="w-12 h-12 rounded-full border-2 border-white/30"
                />
              ) : (
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MdAccountCircle className="text-2xl" />
                </div>
              )}
              <div>
                <p className="font-semibold">{authData.name || 'User'}</p>
                <p className="text-sm opacity-80">{authData.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                  setSidebarOpen(false);
                }
              }}
              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
            <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <button
              onClick={() => {
                handleSearch();
                setSidebarOpen(false);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="flex flex-col p-4 space-y-2">
          {menuItems.map((item) => (
            <li key={item}>
              <button
                type="button"
                className={`w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all font-medium ${
                  activeMenu === item 
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                    : 'text-gray-700'
                }`}
                onClick={() => handleMenuSelect(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            © 2024 Exclusive. All rights reserved.
          </p>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;