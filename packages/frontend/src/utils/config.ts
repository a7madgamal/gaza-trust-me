// Environment configuration for the frontend
interface Config {
  trpcUrl: string;
  environment: string;
}

const getConfig = (): Config => {
  const environment = import.meta.env.MODE;
  if (!environment) {
    throw new Error('MODE environment variable is required');
  }

  // In development, use the Vite proxy
  if (environment === 'development') {
    return {
      trpcUrl: '/trpc',
      environment,
    };
  }

  // In production, use the full URL from environment variable
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_API_URL environment variable is required for production');
  }

  // Construct tRPC URL properly
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const trpcUrl = `${baseUrl}/trpc`;

  return {
    trpcUrl,
    environment,
  };
};

export const config = getConfig();
