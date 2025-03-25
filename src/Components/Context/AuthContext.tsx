import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

interface Favorite {
  artistId: string;
  addedAt: string;
}

interface AuthContextType {
  user: any | null;
  favorites: Favorite[];
  toggleFavorite: (artistId: string) => void;
  login: (user: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchFavorites();
    }
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const response = await axios.get(
        "http://localhost:5001/api/auth/favorites",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (artistId: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const response = await axios.post(
        "http://localhost:5001/api/auth/favorites",
        { artistId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const login = (user: any, token: string) => {
    Cookies.set("token", token, { expires: 1 });
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    fetchFavorites();
  };

  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    setUser(null);
    setFavorites([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, favorites, toggleFavorite, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
