import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationFormData, ValidationErrors } from '@/types/auth';
import { validateRegistrationForm, isFormValid } from '@/utils/validation';
import { useAuth } from './useAuth';

export const useRegistrationForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    description: '',
    linkedinUrl: '',
    campaignUrl: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = useCallback(
    (field: keyof RegistrationFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }

      // Clear API error when user makes changes
      if (apiError) {
        setApiError('');
      }
    },
    [errors, apiError]
  );

  const validateForm = useCallback(() => {
    const validationErrors = validateRegistrationForm(formData);
    setErrors(validationErrors);
    return isFormValid(validationErrors);
  }, [formData]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      console.log('Registration form submitted', formData);

      if (!validateForm()) {
        console.log('Form validation failed');
        return;
      }

      setLoading(true);
      setApiError('');

      console.log('Making Supabase signup request');
      signup(formData.email, formData.password, {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        description: formData.description,
        linkedin_url: formData.linkedinUrl,
        campaign_url: formData.campaignUrl,
      })
        .then(result => {
          console.log('Backend signup response:', result);

          if (!result) {
            setApiError('Registration failed. Please try again.');
            return;
          }

          // Check if email verification is required
          if ('requiresEmailVerification' in result && result.requiresEmailVerification) {
            console.log('Registration successful, email verification required');
            navigate('/login', { state: { needsVerification: true } });
          } else if (result.user) {
            console.log('Registration successful, user logged in');
            navigate('/dashboard');
          } else {
            console.log('Registration successful');
            navigate('/login', { state: { registrationComplete: true } });
          }
        })
        .catch((error: unknown) => {
          console.error('Registration error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
          setApiError(errorMessage);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [formData, validateForm, navigate, signup]
  );

  return {
    formData,
    errors,
    loading,
    apiError,
    handleChange,
    handleSubmit,
  };
};
