"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount to persist session on reload
  useEffect(() => {
    const savedUser = localStorage.getItem("crowd_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const finalToken = token || "mock-jwt-token-12345";
    setUser(userData);
    localStorage.setItem("crowd_user", JSON.stringify(userData));
    localStorage.setItem("crowd_token", finalToken);
    
    // Set cookie on client side for route protection
    document.cookie = `crowd_token=${finalToken}; path=/; max-age=604800; SameSite=Lax`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crowd_user");
    localStorage.removeItem("crowd_token");
    
    // Clear cookie
    document.cookie = "crowd_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const updateCredits = (newCredits) => {
    if (user) {
      const updated = { ...user, credits: newCredits };
      setUser(updated);
      localStorage.setItem("crowd_user", JSON.stringify(updated));
    }
  };

  // Helper method to easily switch roles for testing
  const mockSetRole = (role) => {
    if (!role) {
      logout();
      return;
    }

    const mockUsers = {
      Supporter: {
        name: "Sam Supporter",
        email: "supporter@crowd.com",
        role: "Supporter",
        credits: 50,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
      Creator: {
        name: "Chris Creator",
        email: "creator@crowd.com",
        role: "Creator",
        credits: 20,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      },
      Admin: {
        name: "Alex Admin",
        email: "admin@crowd.com",
        role: "Admin",
        credits: 1000,
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      },
    };

    if (mockUsers[role]) {
      login(mockUsers[role]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateCredits,
        mockSetRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
