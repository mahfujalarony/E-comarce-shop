import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

// লোডিং কম্পোনেন্ট
const LoadingScreen = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // পূর্ণ স্ক্রিন উচ্চতা
        backgroundColor: '#f0f2f5', // হালকা ব্যাকগ্রাউন্ড
        color: '#333', // টেক্সট কালার
        fontSize: '1.5rem',
        fontWeight: 'bold',
      }}
    >
      <div>
        <p>Loading.....</p>
        {/* অপশনাল: স্পিনার যোগ করতে পারেন */}
        <div
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}
        />
      </div>
    </div>
  );
};

// CSS অ্যানিমেশনের জন্য গ্লোবাল স্টাইল (ইনলাইন বা CSS ফাইলে যোগ করুন)
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// গ্লোবাল স্টাইল যোগ করা
const styleSheet = document.createElement('style');
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

interface AdminOnlyRouteProps {
  children: ReactNode;
}

const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ children }) => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setAllowed(false);
          return;
        }

        await axios.get('http://localhost:3001/api/roleckk', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAllowed(true);
      } catch (err) {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <LoadingScreen />;
  if (!allowed) return <Navigate to="/admin/request" />;

  return <>{children}</>;
};

export default AdminOnlyRoute;