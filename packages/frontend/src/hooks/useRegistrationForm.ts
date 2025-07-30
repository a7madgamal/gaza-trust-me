import {useState, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {RegistrationFormData, ValidationErrors} from "@/types/auth";
import {validateRegistrationForm, isFormValid} from "@/utils/validation";

export const useRegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = useCallback(
    (field: keyof RegistrationFormData) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFormData((prev) => ({...prev, [field]: value}));

        // Clear field error when user starts typing
        if (errors[field]) {
          setErrors((prev) => ({...prev, [field]: undefined}));
        }

        // Clear API error when user makes changes
        if (apiError) {
          setApiError("");
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

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setApiError("");

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setApiError(
            errorData.message || "Registration failed. Please try again."
          );
          return;
        }

        // Registration successful
        navigate("/login?registered=true");
      } catch (error) {
        setApiError(
          "Network error. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm, navigate]
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
