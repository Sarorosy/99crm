import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    const storedAuthData = JSON.parse(sessionStorage.getItem('authState'));
    if (storedAuthData) {
      setAuthState(storedAuthData);
    }
  }, []);

  const login = (userData) => {
    setAuthState(userData);
    sessionStorage.setItem('authState', JSON.stringify(userData));
  };

  const logout = () => {
    setAuthState(null);
    sessionStorage.removeItem('authState');
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
