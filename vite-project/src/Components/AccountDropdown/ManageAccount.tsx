import React from 'react';
import { useAuth } from '../auth/AuthContext'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import {
  FaShoppingBag,
  FaFileAlt, // Using FaFileAlt for AssignmentIcon (Quote)
  FaEdit,
  FaLock,
  FaMapMarkerAlt,
  FaHeart,
  FaMoneyBillWave,
  FaTachometerAlt, // Using FaTachometerAlt for DashboardIcon
} from 'react-icons/fa';

// Define menuItems with React Icons and Tailwind classes for icon color
const menuItems = [
  { icon: <FaShoppingBag className="text-blue-600" />, label: 'Orders', path: '/orders' },
  { icon: <FaFileAlt className="text-blue-600" />, label: 'Quote', path: '/account/quote' },
  { icon: <FaEdit className="text-blue-600" />, label: 'Edit Profile', path: '/account/edit-profile' },
  { icon: <FaLock className="text-blue-600" />, label: 'Change Password', path: '/account/change-password' },
  { icon: <FaMapMarkerAlt className="text-blue-600" />, label: 'Addresses', path: '/addresses' },
  { icon: <FaHeart className="text-blue-600" />, label: 'Wish List', path: '/wishlist' },
  { icon: <FaMoneyBillWave className="text-blue-600" />, label: 'Your Transactions', path: '/account/transactions' },
];

const ManageAccount: React.FC = () => {
  const navigate = useNavigate();
  const { authData } = useAuth();
  const name = authData?.name;
  const imgUrl = authData?.imgUrl;
  const role = authData?.role;

  return (
    <div className="min-h-screen w-full bg-gray-100 py-2 md:py-8 px-2 md:px-4 flex items-center justify-center overflow-auto">
      <div className="w-full sm:w-[95%] md:max-w-5xl lg:max-w-6xl mx-auto p-4 sm:p-6 md:p-8 bg-white shadow-xl rounded-none sm:rounded-xl min-h-screen sm:min-h-0 md:min-h-[90vh] flex flex-col">
        {/* Admin Dashboard Button */}
        {role === 'admin' && (
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 md:py-4 px-4 rounded-lg flex items-center justify-center mb-4 md:mb-6 text-base md:text-lg tracking-wide transition-colors duration-300"
            onClick={() => navigate('/admin')}
          >
            <FaTachometerAlt className="mr-2" /> Admin Dashboard
          </button>
        )}

        {/* User Info */}
        <div className="flex items-center mb-6 md:mb-8 flex-col sm:flex-row text-center sm:text-left">
          <div className="w-20 h-20 md:w-16 md:h-16 sm:mr-4 mb-4 sm:mb-0 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl md:text-3xl overflow-hidden flex-shrink-0">
            {imgUrl ? (
              <img src={imgUrl} alt={name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <span>{name ? name[0].toUpperCase() : 'U'}</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Hello,</p>
            <h2 className="font-bold text-xl md:text-2xl text-gray-800">{name || 'User'}</h2>
            <p className="text-xs text-gray-500 capitalize">Role: {role || 'user'}</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 flex-1">
          {menuItems.map((item) => (
            <div
              key={item.label}
              className="bg-white shadow-md rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out min-h-[100px] sm:min-h-[110px] md:min-h-[120px] hover:shadow-xl hover:bg-gray-50 hover:-translate-y-0.5"
              onClick={() => navigate(item.path)}
            >
              <div className="text-3xl sm:text-4xl mb-2">
                {item.icon}
              </div>
              <p className="font-medium text-center text-xs sm:text-sm leading-tight px-1 text-gray-700">
                {item.label}
              </p>
            </div>
          ))}

          {/* Admin Panel for non-admin users */}
          {role !== 'admin' && (
            <div
              className="bg-yellow-50 shadow-md rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out min-h-[100px] sm:min-h-[110px] md:min-h-[120px] border-2 border-dashed border-gray-300 text-orange-600 hover:shadow-xl hover:bg-yellow-100 hover:-translate-y-0.5"
              onClick={() => navigate('/admin')}
            >
              <FaTachometerAlt className="text-orange-500 text-3xl sm:text-4xl mb-2" />
              <p className="font-bold text-center text-xs sm:text-sm leading-tight px-1">
                Admin Panel
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAccount;