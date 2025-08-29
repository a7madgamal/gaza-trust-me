import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useRegistrationForm } from '@/hooks/useRegistrationForm';

const RegistrationForm = () => {
  const { formData, errors, loading, apiError, handleChange, handleSubmit } = useRegistrationForm();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
        justifyContent: 'center',
        alignItems: 'center',
        px: { xs: 2, sm: 4, md: 0 },
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Account
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Join Gazaconfirm to submit and track help requests
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }} data-testid="error-message">
            {apiError}
          </Alert>
        )}

        {/* Success message will be shown here */}
        <div data-testid="success-message" style={{ display: 'none' }}></div>

        <Box component="form" onSubmit={e => void handleSubmit(e)} sx={{ mt: 2 }} noValidate>
          <TextField
            fullWidth
            label="Full Name"
            type="text"
            margin="normal"
            required
            error={!!errors.fullName}
            helperText={errors.fullName}
            value={formData.fullName}
            onChange={handleChange('fullName')}
            disabled={loading}
            autoComplete="name"
            inputProps={{ 'data-testid': 'fullName' }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
            value={formData.email}
            onChange={handleChange('email')}
            disabled={loading}
            autoComplete="email"
            inputProps={{ 'data-testid': 'email' }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            error={!!errors.password}
            helperText={errors.password}
            value={formData.password}
            onChange={handleChange('password')}
            disabled={loading}
            autoComplete="new-password"
            inputProps={{ 'data-testid': 'password' }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            required
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            disabled={loading}
            autoComplete="new-password"
            inputProps={{ 'data-testid': 'confirmPassword' }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            type="tel"
            margin="normal"
            required
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            value={formData.phoneNumber}
            onChange={handleChange('phoneNumber')}
            disabled={loading}
            autoComplete="tel"
            inputProps={{ 'data-testid': 'phoneNumber' }}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={6}
            margin="normal"
            required
            error={!!errors.description}
            helperText={errors.description || 'Tell us about your situation and what kind of help you need'}
            value={formData.description}
            onChange={handleChange('description')}
            disabled={loading}
            inputProps={{ 'data-testid': 'description' }}
          />

          <TextField
            fullWidth
            label="LinkedIn Profile URL (Optional)"
            type="url"
            margin="normal"
            error={!!errors.linkedinUrl}
            helperText={errors.linkedinUrl || 'Share your LinkedIn profile to help build trust'}
            value={formData.linkedinUrl}
            onChange={handleChange('linkedinUrl')}
            disabled={loading}
            autoComplete="url"
            inputProps={{ 'data-testid': 'linkedinUrl' }}
          />

          <TextField
            fullWidth
            label="Campaign/Fundraising URL (Optional)"
            type="url"
            margin="normal"
            error={!!errors.campaignUrl}
            helperText={errors.campaignUrl || 'Link to your fundraising campaign or project'}
            value={formData.campaignUrl}
            onChange={handleChange('campaignUrl')}
            disabled={loading}
            autoComplete="url"
            inputProps={{ 'data-testid': 'campaignUrl' }}
          />

          <TextField
            fullWidth
            label="Facebook Profile URL (Optional)"
            type="url"
            margin="normal"
            error={!!errors.facebookUrl}
            helperText={errors.facebookUrl || 'Share your Facebook profile to help build trust'}
            value={formData.facebookUrl}
            onChange={handleChange('facebookUrl')}
            disabled={loading}
            autoComplete="url"
            inputProps={{ 'data-testid': 'facebookUrl' }}
          />

          <TextField
            fullWidth
            label="Telegram Profile URL (Optional)"
            type="url"
            margin="normal"
            error={!!errors.telegramUrl}
            helperText={errors.telegramUrl || 'Share your Telegram profile for direct contact'}
            value={formData.telegramUrl}
            onChange={handleChange('telegramUrl')}
            disabled={loading}
            autoComplete="url"
            inputProps={{ 'data-testid': 'telegramUrl' }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            data-testid="register-button"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegistrationForm;
