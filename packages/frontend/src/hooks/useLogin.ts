import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useToast} from "./useToast";
import {useAuth} from "./useAuth";
import {config} from "../utils/config";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
  error?: string;
}

interface AuthUser {
  sub: string;
  email: string;
  role: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {showToast} = useToast();
  const {login: setAuthUser} = useAuth();

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);

    try {
      const response = await fetch(`${config.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user) {
        showToast("Login successful! Welcome back.", "success");
        // Store user data in localStorage or context
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.session) {
          localStorage.setItem("session", JSON.stringify(data.session));
        }
        // Update auth state - transform API user to AuthUser format
        const authUser: AuthUser = {
          sub: data.user.id,
          email: data.user.email,
          role: "authenticated", // Default role for now
        };
        setAuthUser(authUser);
        navigate("/dashboard");
      } else {
        const errorMessage = data.error || "Login failed. Please try again.";
        showToast(errorMessage, "error");
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection.";
      showToast(errorMessage, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {login, loading};
};
