// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("auth");

      if (storedAuth) {
        const data = JSON.parse(storedAuth);

        setUser(data.user || null);
        setToken(data.token || null);
      }
    } catch (err) {
      console.error("Auth load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (authData) => {
    setUser(authData.user);
    setToken(authData.token);

    localStorage.setItem("auth", JSON.stringify(authData));
    localStorage.setItem("token", authData.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("auth");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);