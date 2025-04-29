"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '@/types';
import { getCurrentUser, logout as authLogout } from '@/lib/auth'; // Import your auth functions

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  useEffect(() => {
    // Check for user in session storage on initial load
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false); // Set loading to false after checking
  }, []);

  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    authLogout(); // Call the actual logout function
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
