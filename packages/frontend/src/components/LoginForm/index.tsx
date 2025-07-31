import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from "@mui/material";
import {Link as RouterLink} from "react-router-dom";
import {useState} from "react";
import {useLogin} from "../../hooks/useLogin";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [apiError, setApiError] = useState("");
  const {login, loading} = useLogin();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    try {
      await login({email, password});
    } catch (error) {
      setApiError("Invalid credentials. Please try again.");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({...prev, email: undefined}));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({...prev, password: undefined}));
    }
    if (apiError) {
      setApiError("");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        px: {xs: 2, sm: 4, md: 0},
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign In
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{mb: 3}}
        >
          Welcome back to Gazaconfirm
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{mb: 3}} data-testid="error-message">
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{mt: 2}} noValidate>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            error={!!errors.email}
            helperText={errors.email}
            inputProps={{"data-testid": "email"}}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            error={!!errors.password}
            helperText={errors.password}
            inputProps={{"data-testid": "password"}}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{mt: 3, mb: 2}}
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <Box sx={{textAlign: "center"}}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link component={RouterLink} to="/register" variant="body2">
                Create one
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;
