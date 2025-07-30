import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
} from "@mui/material";
import {Link as RouterLink} from "react-router-dom";

const HomePage = () => {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Gazaconfirm
          </Typography>
          <Button color="inherit" component={RouterLink} to="/login">
            Sign In
          </Button>
          <Button color="inherit" component={RouterLink} to="/register">
            Register
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{mt: 8, textAlign: "center"}}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Gazaconfirm
        </Typography>

        <Typography variant="h5" color="text.secondary" paragraph>
          Submit and track help requests with ease
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{mb: 4}}>
          Join our platform to connect with people who need help and those who
          can provide it.
        </Typography>

        <Box sx={{mt: 4}}>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{mr: 2}}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/login"
          >
            Sign In
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
