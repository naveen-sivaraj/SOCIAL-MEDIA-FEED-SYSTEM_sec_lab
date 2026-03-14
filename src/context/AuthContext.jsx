import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [localUsers, setLocalUsers] = useState([]);

  // Load user & registered custom users from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('socialFeedUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    const storedLocalUsers = localStorage.getItem('socialFeedLocalUsers');
    if (storedLocalUsers) {
      setLocalUsers(JSON.parse(storedLocalUsers));
    }
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('socialFeedUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('socialFeedUser');
  };

  const registerUser = (newUserObj) => {
    const userToSave = {
      ...newUserObj,
      id: Date.now(), // Generate a unique numerical ID for local users
      isLocal: true
    };
    
    const updatedLocalUsers = [...localUsers, userToSave];
    setLocalUsers(updatedLocalUsers);
    localStorage.setItem('socialFeedLocalUsers', JSON.stringify(updatedLocalUsers));
    
    // Automatically log them in after registration
    login(userToSave);
  };

  return (
    <AuthContext.Provider value={{ currentUser, localUsers, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};
