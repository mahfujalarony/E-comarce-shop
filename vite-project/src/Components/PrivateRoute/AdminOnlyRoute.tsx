import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';


interface AdminOnlyRouteProps {
  children: ReactNode;
}

const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ children }) => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setAllowed(false);
          return;
        }

        await axios.get("http://localhost:3001/api/roleckk", {
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

  if (loading) return <p>Loading...</p>;
  if (!allowed) return <Navigate to="/admin/request" />;

  return <>{children}</>;
};

export default AdminOnlyRoute;
