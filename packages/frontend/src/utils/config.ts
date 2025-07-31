// Environment configuration for the frontend
interface Config {
  apiUrl: string;
  environment: string;
}

const getConfig = (): Config => {
  const environment = import.meta.env.MODE;
  if (!environment) {
    throw new Error("MODE environment variable is required");
  }

  // In development, use the Vite proxy
  if (environment === "development") {
    return {
      apiUrl: "/api",
      environment,
    };
  }

  // In production, use the full URL from environment variable
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error(
      "VITE_API_URL environment variable is required for production"
    );
  }

  return {
    apiUrl,
    environment,
  };
};

export const config = getConfig();
