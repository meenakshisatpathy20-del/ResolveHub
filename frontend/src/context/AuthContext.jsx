import { createContext, useCallback, useContext, useEffect, useState } from "react";

import API from "../services/api";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored && localStorage.getItem("token") ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(readStoredUser()));

  // Refresh the user from the server on load so role/org changes apply
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }

    API.get("/auth/profile")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
