import React, { useEffect, createContext, useContext, useState } from "react";

interface AuthData {
  name: string | null;
  userId: string | null;
  email: string | null;
  password?: string | null;
  imgUrl?: string | null;
  isAuthenticated: boolean;
  token?: string | null;
  role?: string | null; 
}

interface AuthContextType {
  authData: AuthData;
  setAuthData: React.Dispatch<React.SetStateAction<AuthData>>;
  logout: () => void;
}


interface AuthContextType {
  authData: AuthData;
  setAuthData: React.Dispatch<React.SetStateAction<AuthData>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>({
    name: null,
    email: null,
    userId: null,
    password: null,
    imgUrl: null,
    isAuthenticated: false,
    token: null,
    role: null,
  });
 // console.log("AuthProvider initialized with authData:", authData);

   const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Reset auth state
    setAuthData({
      name: null,
      email: null,
      userId: null,
      password: null,
      imgUrl: null,
      isAuthenticated: false,
      token: null,
      role: null,
    });
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthData((prev) => ({
          ...prev,
          isAuthenticated: false,
          token: null,
        }));
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/check-token-valid-and-reset-local-storage`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Token validation failed with status ${response.status}`);
        }

        const data = await response.json();
        setAuthData({
          name: data.user.name || null,
          email: data.user.email || null,
          userId: data.user._id || null,
          imgUrl: data.user.imgUrl || null,
          isAuthenticated: true,
          token: data.token || token,
          role: data.user.role || null,
        });
      } catch (error) {
        console.error("Error validating token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthData({
          name: null,
          email: null,
          userId: null,
          password: null,
          imgUrl: null,
          isAuthenticated: false,
          token: null,
          role: null,
        });
      }
    };

    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ authData, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};