import {Box, Paper, Typography, TextField, Button, Link} from "@mui/material";
import {Link as RouterLink} from "react-router-dom";
import {useState} from "react";
import {useLogin} from "../../hooks/useLogin";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {login, loading} = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    await login({email, password});
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

        <Box component="form" onSubmit={handleSubmit} sx={{mt: 2}}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{mt: 3, mb: 2}}
            disabled={loading}
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
