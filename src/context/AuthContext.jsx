import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
    }
  };

  const clearToken = () => {
    setTokenState(null);
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
  };

  useEffect(() => {
    // Sync token from localStorage on mount
    const storedToken = localStorage.getItem("token");
    if (storedToken && !token) {
      setTokenState(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
