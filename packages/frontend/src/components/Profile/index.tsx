import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {useState, useEffect, useCallback} from "react";
import {useToast} from "../../hooks/useToast";
import {config} from "../../utils/config";

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
}

const Profile = () => {
  const {showToast} = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState<{fullName?: string}>({});
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const session = localStorage.getItem("session");
      const sessionData = session ? JSON.parse(session) : null;

      if (!sessionData?.access_token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${config.apiUrl}/trpc/getProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.result?.data?.success) {
        const profileData = data.result.data.data;
        setProfile(profileData);
        setFormData({
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber || "",
        });
      } else {
        throw new Error(data.result?.data?.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const validateForm = () => {
    const newErrors: {fullName?: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const session = localStorage.getItem("session");
      const sessionData = session ? JSON.parse(session) : null;

      if (!sessionData?.access_token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${config.apiUrl}/trpc/updateProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.access_token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.result?.data?.success) {
        showToast("Profile updated successfully", "success");
        setEditMode(false);
        await fetchProfile(); // Refresh profile data
      } else {
        throw new Error(data.result?.data?.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile?.fullName || "",
      phoneNumber: profile?.phoneNumber || "",
    });
    setErrors({});
    setEditMode(false);
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, fullName: e.target.value});
    if (errors.fullName) {
      setErrors((prev) => ({...prev, fullName: undefined}));
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, phoneNumber: e.target.value});
  };

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

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{mt: 4}}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{mt: 4, mb: 4}}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      <Paper elevation={3} sx={{p: 4, mt: 3}}>
        <Grid container spacing={4}>
          {/* Avatar Section */}
          <Grid item xs={12} md={3} sx={{textAlign: "center"}}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: "3rem",
                bgcolor: "primary.main",
                mx: "auto",
                mb: 2,
              }}
            >
              {profile.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography
              variant="h6"
              gutterBottom
              data-testid="profile-fullName"
            >
              {profile.fullName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              data-testid="profile-role"
            >
              {profile.role.replace("_", " ").toUpperCase()}
            </Typography>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{mb: 3}} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profile.email}
                  disabled
                  helperText="Email cannot be changed"
                  inputProps={{"data-testid": "profile-email"}}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={profile.role.replace("_", " ").toUpperCase()}
                  disabled
                  helperText="Role is managed by administrators"
                  inputProps={{"data-testid": "profile-role-display"}}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleFullNameChange}
                  disabled={!editMode}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  inputProps={{"data-testid": "profile-fullName-input"}}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handlePhoneNumberChange}
                  disabled={!editMode}
                  inputProps={{"data-testid": "profile-phoneNumber-input"}}
                />
              </Grid>
            </Grid>

            <Box sx={{mt: 4, display: "flex", gap: 2}}>
              {editMode ? (
                <>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    data-testid="save-profile-button"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    data-testid="cancel-profile-button"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setEditMode(true)}
                  data-testid="edit-profile-button"
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
