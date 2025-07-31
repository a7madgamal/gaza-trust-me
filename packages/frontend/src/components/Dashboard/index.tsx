import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import {useState, useEffect} from "react";
import {Link as RouterLink} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";

const Dashboard = () => {
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll show a placeholder since cases aren't implemented yet
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{mb: 4}}>
        Welcome back, {user?.email}! Manage your help requests and account.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{mb: 4}}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Cases
              </Typography>
              <Typography variant="h4" component="div">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Review
              </Typography>
              <Typography variant="h4" component="div">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4" component="div">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h4" component="div">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={3} sx={{p: 4, mb: 4}}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              component={RouterLink}
              to="/submit-case"
              disabled
            >
              Submit New Case
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={RouterLink} to="/profile">
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Cases */}
      <Paper elevation={3} sx={{p: 4}}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">Recent Cases</Typography>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/my-cases"
            disabled
          >
            View All
          </Button>
        </Box>

        {/* The cases.length === 0 block was removed as per the edit hint */}
        <Alert severity="info" sx={{mb: 2}}>
          You haven't submitted any help requests yet.
          <Button
            component={RouterLink}
            to="/submit-case"
            sx={{ml: 1}}
            disabled
          >
            Submit your first case
          </Button>
        </Alert>
      </Paper>

      {/* Coming Soon Notice */}
      <Alert severity="info" sx={{mt: 4}}>
        <Typography variant="body2">
          <strong>Coming Soon:</strong> Case submission, file uploads, and case
          management features are currently being developed. You'll be able to
          submit help requests with images and track their approval status.
        </Typography>
      </Alert>
    </Container>
  );
};

export default Dashboard;
