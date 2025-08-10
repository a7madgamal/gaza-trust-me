import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { z } from 'zod';

type UserStatus = 'pending' | 'verified' | 'flagged';

const statusFilterSchema = z.union([z.literal(''), z.enum(['pending', 'verified', 'flagged'])]);

interface User {
  id: string;
  url_id: number;
  email: string;
  full_name: string;
  description: string;
  phone_number: string;
  status: UserStatus;
  role: 'help_seeker' | 'admin' | 'super_admin';
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;

    user: User | null;

    action: 'verify' | 'flag' | null;
  }>({
    open: false,
    user: null,
    action: null,
  });
  const [remarks, setRemarks] = useState('');

  const limit = 20;
  const offset = (page - 1) * limit;

  // Fetch users
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = trpc.adminGetUsers.useQuery(
    {
      status: statusFilter || undefined,
      limit,
      offset,
    },
    {
      enabled: !!userProfile,
    }
  );

  // Update user status mutation
  const updateUserStatusMutation = trpc.adminUpdateUserStatus.useMutation({
    onSuccess: result => {
      if (result.success) {
        showToast('User status updated successfully', 'success');
        refetchUsers();
        setActionDialog({ open: false, user: null, action: null });
        setRemarks('');
      } else {
        showToast(result.error || 'Failed to update user status', 'error');
      }
    },
    onError: error => {
      showToast(error.message || 'Failed to update user status', 'error');
    },
  });

  const handleAction = (user: User, action: 'verify' | 'flag') => {
    setActionDialog({ open: true, user, action });
  };

  const confirmAction = async () => {
    if (!actionDialog.user || !actionDialog.action) return;

    await updateUserStatusMutation.mutateAsync({
      userId: actionDialog.user.id,
      action: actionDialog.action,
      remarks: remarks || undefined,
    });
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'verified':
        return 'success';
      case 'flagged':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'super_admin':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (!userProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (userProfile.role !== 'admin' && userProfile.role !== 'super_admin') {
    return (
      <Box p={3}>
        <Alert severity="error">You don't have permission to access the admin dashboard.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom data-testid="admin-dashboard-title">
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom data-testid="admin-welcome-message">
        Welcome, {userProfile.full_name} ({userProfile.role})
      </Typography>

      {/* Filters */}
      <Box mb={3} display="flex" gap={2} alignItems="center">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            data-testid="status-filter"
            onChange={e => {
              const result = statusFilterSchema.safeParse(e.target.value);
              if (result.success) {
                setStatusFilter(result.data);
              }
              setPage(1);
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="flagged">Flagged</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Users Table */}
      <Paper>
        <TableContainer data-testid="users-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : usersError ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Alert severity="error">{usersError.message || 'Failed to load users'}</Alert>
                  </TableCell>
                </TableRow>
              ) : usersData?.success && usersData.data?.users && usersData.data.users.length > 0 ? (
                usersData.data.users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.status === 'verified' ? (
                        <Link
                          component={RouterLink}
                          to={`/user/${user.url_id}`}
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {user.full_name}
                        </Link>
                      ) : (
                        user.full_name
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                    <TableCell>
                      <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={user.status} color={getStatusColor(user.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.status === 'pending' && (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleAction(user, 'verify')}
                            disabled={updateUserStatusMutation.isLoading}
                            data-testid={`verify-button-${user.id}`}
                          >
                            Verify
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleAction(user, 'flag')}
                            disabled={updateUserStatusMutation.isLoading}
                            data-testid={`flag-button-${user.id}`}
                          >
                            Flag
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      {usersData?.success && usersData.data?.total && usersData.data.total > limit && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil((usersData.data?.total || 0) / limit)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
          />
        </Box>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, user: null, action: null })}
        data-testid="action-dialog"
      >
        <DialogTitle data-testid="action-dialog-title">
          {actionDialog.action === 'verify' ? 'Verify User' : 'Flag User'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {actionDialog.action} {actionDialog.user?.full_name}?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks (optional)"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            margin="normal"
            placeholder="Add any notes about this action..."
            data-testid="remarks-input"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setActionDialog({ open: false, user: null, action: null })}
            disabled={updateUserStatusMutation.isLoading}
            data-testid="cancel-action-button"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={actionDialog.action === 'verify' ? 'success' : 'error'}
            disabled={updateUserStatusMutation.isLoading}
            data-testid="confirm-action-button"
          >
            {updateUserStatusMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : actionDialog.action === 'verify' ? (
              'Verify'
            ) : (
              'Flag'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
