import React from 'react';
import { useAuth } from '../auth/AuthContext';

interface AuthData {
  name: string;
  imgUrl?: string;
}

const ManageAccount: React.FC = () => {
    const { authData } = useAuth();
    const { name, imgUrl } = authData as AuthData;
    const user = {
        name: name || 'User',
        imgUrl: imgUrl || '',
        starPoints: 0,
        storeCredit: 0,
    };

    const menuItems = [
        { icon: '📦', label: 'Orders' },
        { icon: '📝', label: 'Quote' },
        { icon: '👤', label: 'Edit Profile' },
        { icon: '🔒', label: 'Change Password' },
        { icon: '📍', label: 'Addresses' },
        { icon: '❤️', label: 'Wish List' },
        { icon: '💻', label: 'Saved PC' },
        { icon: '⭐', label: 'Star Points' },
        { icon: '💸', label: 'Your Transactions' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                {/* Header Section */}
                <div className="flex items-center pb-4 border-b border-gray-200 mb-6">
                    <div className="text-gray-500 mr-4">
                        <span className="text-lg">/</span> Account
                    </div>
                </div>

                {/* User Info Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                            {imgUrl ? (
                                <img 
                                    src={imgUrl} 
                                    alt={name} 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className="text-gray-600">Hello,</p>
                            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                        </div>
                    </div>
                    <div className="flex space-x-8 text-right">
                        <div>
                            <p className="text-gray-600">Star Points</p>
                            <p className="text-lg font-bold text-red-500">{user.starPoints}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Store Credit</p>
                            <p className="text-lg font-bold text-red-500">{user.storeCredit}</p>
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="text-4xl mb-2">{item.icon}</div>
                            <p className="text-sm font-medium text-gray-700">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageAccount;