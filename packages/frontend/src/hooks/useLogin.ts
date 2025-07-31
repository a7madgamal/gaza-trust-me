import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

interface LoginCredentials {
  email: string;
  password: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login: authLogin } = useAuth();

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);

    try {
      // Use the auth context login function
      await authLogin(credentials.email, credentials.password);
      showToast('Login successful! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection.';
      showToast(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};
