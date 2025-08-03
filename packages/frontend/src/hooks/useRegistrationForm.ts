import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationFormData, ValidationErrors } from '@/types/auth';
import { validateRegistrationForm, isFormValid } from '@/utils/validation';
import { trpc } from '@/utils/trpc';

export const useRegistrationForm = () => {
  const navigate = useNavigate();
  const registerMutation = trpc.register.useMutation();
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
    async (event: React.FormEvent) => {
      event.preventDefault();
      console.log('Registration form submitted', formData);

      if (!validateForm()) {
        console.log('Form validation failed');
        return;
      }

      setLoading(true);
      setApiError('');

      try {
        console.log('Making tRPC registration request');
        const result = await registerMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          description: formData.description,
          linkedinUrl: formData.linkedinUrl,
          campaignUrl: formData.campaignUrl,
        });

        console.log('tRPC response:', result);

        if (!result.success) {
          setApiError(result.error || 'Registration failed. Please try again.');
          return;
        }

        // Registration successful
        console.log('Registration successful, navigating to login');
        navigate('/login?registered=true');
      } catch (error) {
        console.error('Registration error:', error);
        setApiError('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm, navigate, registerMutation]
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
