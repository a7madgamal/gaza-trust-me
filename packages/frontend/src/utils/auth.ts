import {config} from "./config";

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
}

interface UserInfo {
  sub: string;
  email: string;
  role: string;
  aud: string;
  exp: number;
  iat: number;
}

export const getStoredTokens = (): AuthTokens | null => {
  try {
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    const expires_at = parseInt(localStorage.getItem("expires_at") || "0");
    const token_type = localStorage.getItem("token_type") || "";

    if (!access_token || !refresh_token) {
      return null;
    }

    return {
      access_token,
      refresh_token,
      expires_at,
      token_type,
    };
  } catch (error) {
    console.error("Failed to get stored tokens:", error);
    return null;
  }
};

export const isTokenValid = (): boolean => {
  const tokens = getStoredTokens();
  if (!tokens) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return tokens.expires_at > now;
};

export const isTokenExpiringSoon = (): boolean => {
  const tokens = getStoredTokens();
  if (!tokens) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  return tokens.expires_at - now < fiveMinutes;
};

export const refreshToken = async (): Promise<boolean> => {
  try {
    const tokens = getStoredTokens();
    if (!tokens) {
      return false;
    }

    const response = await fetch(`${config.apiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: tokens.refresh_token,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    if (data.success && data.session) {
      // Update stored tokens
      localStorage.setItem("access_token", data.session.access_token);
      localStorage.setItem("refresh_token", data.session.refresh_token);
      localStorage.setItem("expires_at", data.session.expires_at.toString());
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires_at");
  localStorage.removeItem("token_type");
  localStorage.removeItem("user");
};

export const getCurrentUser = (): UserInfo | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return isTokenValid() && getCurrentUser() !== null;
};
