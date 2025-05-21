import React, {useEffect,  createContext, useContext, useState } from "react";

interface AuthData {
  name: string | null;
  email: string | null;
  password?: string;
  imgUrl?: string | null;
  isAuthenticated: boolean;
}


interface AuthContextType {
  authData: AuthData;
  setAuthData: React.Dispatch<React.SetStateAction<AuthData>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>({
    name: "",
    email: "",
    password: "",
    imgUrl: "",
    isAuthenticated: false,
  });
 

useEffect(() => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    const parsedUser = JSON.parse(user);
    setAuthData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      imgUrl: parsedUser.imgUrl || "",
      isAuthenticated: true,
    });
  }
}, []);


  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};