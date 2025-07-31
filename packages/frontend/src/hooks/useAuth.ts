import {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useToast} from "./useToast";
import {
  isAuthenticated,
  getCurrentUser,
  clearAuthData,
  refreshToken,
  isTokenExpiringSoon,
} from "../utils/auth";

interface User {
  sub: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {showToast} = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          setUser(currentUser);

          // Check if token is expiring soon and refresh if needed
          if (isTokenExpiringSoon()) {
            const refreshed = await refreshToken();
            if (!refreshed) {
              throw new Error("Token refresh failed");
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Handle auth failure without calling logout to avoid circular dependency
        clearAuthData();
        setUser(null);
        // Only show error and redirect if we're not already on login page
        if (window.location.pathname !== "/login") {
          showToast("Authentication failed. Please log in again.", "error");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [showToast, navigate]);

  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    showToast("You have been logged out.", "info");
    navigate("/login");
  }, [showToast, navigate]);

  const login = useCallback((userData: User) => {
    setUser(userData);
    setLoading(false); // Ensure loading is set to false when user logs in
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    login,
  };
};
