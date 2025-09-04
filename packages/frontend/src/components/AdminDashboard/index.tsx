import React, { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
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
  status: UserStatus | null;
  role: 'help_seeker' | 'admin' | 'super_admin';
  verified_by: string | null;
  verified_by_admin?: {
    full_name: string;
  } | null;
  created_at: string | null;
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [roleFilter, setRoleFilter] = useState<'help_seeker' | 'admin' | 'super_admin' | ''>('');
  const [searchFilter, setSearchFilter] = useState('');
  const debouncedSearchFilter = useDebounce(searchFilter, 300);
  const [sortBy, setSortBy] = useState<'full_name' | 'role' | 'status' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchFilter, statusFilter, roleFilter, sortBy, sortOrder]);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    user: User | null;
    action: 'verify' | 'flag' | null;
  }>({
    open: false,
    user: null,
    action: null,
  });
  const [roleUpgradeDialog, setRoleUpgradeDialog] = useState<{
    open: boolean;
    user: User | null;
    newRole: 'admin' | 'help_seeker' | null;
  }>({
    open: false,
    user: null,
    newRole: null,
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
      role: roleFilter || undefined,
      search: debouncedSearchFilter || undefined,
      sortBy,
      sortOrder,
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
        void refetchUsers();
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

  const upgradeUserRoleMutation = trpc.adminUpgradeUserRole.useMutation({
    onSuccess: result => {
      if (result.success) {
        const actionText =
          result.data?.action === 'upgrade_to_admin' ? 'upgraded to admin' : 'downgraded to help seeker';
        showToast(`User ${actionText} successfully`, 'success');
        void refetchUsers();
        setRoleUpgradeDialog({ open: false, user: null, newRole: null });
        setRemarks('');
      } else {
        showToast(result.error || 'Failed to update user role', 'error');
      }
    },
    onError: error => {
      showToast(error.message || 'Failed to update user role', 'error');
    },
  });

  const handleAction = (user: User, action: 'verify' | 'flag') => {
    setActionDialog({ open: true, user, action });
  };

  const handleRoleUpgrade = (user: User, newRole: 'admin' | 'help_seeker') => {
    setRoleUpgradeDialog({ open: true, user, newRole });
  };

  const confirmAction = async () => {
    if (!actionDialog.user || !actionDialog.action) return;

    await updateUserStatusMutation.mutateAsync({
      userId: actionDialog.user.id,
      action: actionDialog.action,
      remarks: remarks || undefined,
    });
  };

  const confirmRoleUpgrade = async () => {
    if (!roleUpgradeDialog.user || !roleUpgradeDialog.newRole) return;

    await upgradeUserRoleMutation.mutateAsync({
      userId: roleUpgradeDialog.user.id,
      newRole: roleUpgradeDialog.newRole,
      remarks: remarks || undefined,
    });
  };

  const getStatusColor = (status: UserStatus | null) => {
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

  const handleSort = (field: 'full_name' | 'role' | 'status' | 'created_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'full_name' | 'role' | 'status' | 'created_at') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography
        variant="h4"
        gutterBottom
        data-testid="admin-dashboard-title"
        sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
      >
        Admin Dashboard
      </Typography>

      {/* Filters */}
      <Box
        mb={3}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <TextField
          label="Search"
          placeholder="Search by name, email, or description..."
          value={searchFilter}
          onChange={e => {
            setSearchFilter(e.target.value);
          }}
          sx={{
            minWidth: { xs: '100%', sm: 250, md: 300 },
            maxWidth: { xs: '100%', sm: 'none' },
          }}
          data-testid="search-filter"
        />
        <FormControl
          sx={{
            minWidth: { xs: '100%', sm: 180, md: 200 },
            maxWidth: { xs: '100%', sm: 'none' },
          }}
        >
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
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="flagged">Flagged</MenuItem>
          </Select>
        </FormControl>
        {userProfile?.role === 'super_admin' && (
          <FormControl
            sx={{
              minWidth: { xs: '100%', sm: 180, md: 200 },
              maxWidth: { xs: '100%', sm: 'none' },
            }}
          >
            <InputLabel>Role Filter</InputLabel>
            <Select
              value={roleFilter}
              label="Role Filter"
              data-testid="role-filter"
              onChange={e => {
                const value = e.target.value;
                if (value === '' || value === 'help_seeker' || value === 'admin' || value === 'super_admin') {
                  setRoleFilter(value);
                }
              }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="help_seeker">Help Seeker</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Users Table */}
      <Paper>
        <TableContainer
          data-testid="users-table"
          sx={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            maxHeight: '70vh',
          }}
        >
          <Table sx={{ minWidth: { xs: 650, sm: 800 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: { xs: 120, sm: 150 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Sort by name">
                      <IconButton
                        size="small"
                        onClick={() => handleSort('full_name')}
                        sx={{ p: 0 }}
                        data-testid="sort-name"
                      >
                        Name {getSortIcon('full_name')}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell sx={{ minWidth: { xs: 120, sm: 180 } }}>
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Email</Typography>
                </TableCell>
                <TableCell sx={{ minWidth: { xs: 100, sm: 120 } }}>
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Phone</Typography>
                </TableCell>
                <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Sort by role">
                      <IconButton size="small" onClick={() => handleSort('role')} sx={{ p: 0 }} data-testid="sort-role">
                        <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Role {getSortIcon('role')}
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Sort by status">
                      <IconButton
                        size="small"
                        onClick={() => handleSort('status')}
                        sx={{ p: 0 }}
                        data-testid="sort-status"
                      >
                        <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Status {getSortIcon('status')}
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell sx={{ minWidth: { xs: 100, sm: 150 } }}>
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Description</Typography>
                </TableCell>
                <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Sort by created date">
                      <IconButton
                        size="small"
                        onClick={() => handleSort('created_at')}
                        sx={{ p: 0 }}
                        data-testid="sort-created"
                      >
                        <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Created {getSortIcon('created_at')}
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell sx={{ minWidth: { xs: 100, sm: 120 } }}>
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</Typography>
                </TableCell>
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
                    <TableCell sx={{ minWidth: { xs: 120, sm: 150 } }}>
                      {user.role === 'admin' || user.role === 'super_admin' ? (
                        <Link
                          component={RouterLink}
                          to={`/admins/${user.id}`}
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
                      ) : user.status === 'verified' ? (
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
                    <TableCell sx={{ minWidth: { xs: 120, sm: 180 } }}>
                      <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{user.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: 100, sm: 120 } }}>
                      <Link
                        href={`https://wa.me/${user.phone_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          textDecoration: 'none',
                          color: '#25D366',
                          fontWeight: 500,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          '&:hover': {
                            textDecoration: 'underline',
                            color: '#128C7E',
                          },
                        }}
                        data-testid={`whatsapp-link-${user.id}`}
                      >
                        {user.phone_number}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>
                      <Chip
                        label={user.status || 'N/A'}
                        color={getStatusColor(user.status)}
                        size="small"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                      {user.status === 'verified' && user.verified_by && (
                        <Box mt={0.5}>
                          <Link
                            component={RouterLink}
                            to={`/admins/${user.verified_by}`}
                            target="_blank"
                            sx={{
                              textDecoration: 'none',
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            Verified by admin
                          </Link>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: 100, sm: 150 } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: { xs: 120, sm: 200 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>
                      <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: 100, sm: 120 } }}>
                      {user.status === 'pending' && (
                        <Box display="flex" gap={1} flexDirection="row">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleAction(user, 'verify')}
                            disabled={updateUserStatusMutation.isPending}
                            data-testid={`verify-button-${user.id}`}
                            sx={{
                              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              px: { xs: 1, sm: 1.5 },
                              py: { xs: 0.5, sm: 0.75 },
                              '&:hover': {
                                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                              },
                            }}
                          >
                            Verify
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleAction(user, 'flag')}
                            disabled={updateUserStatusMutation.isPending}
                            data-testid={`flag-button-${user.id}`}
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              px: { xs: 1, sm: 1.5 },
                              py: { xs: 0.5, sm: 0.75 },
                            }}
                          >
                            Flag
                          </Button>
                        </Box>
                      )}
                      {/* Super admin role management */}
                      {userProfile.role === 'super_admin' && user.role !== 'super_admin' && (
                        <Box display="flex" gap={1} mt={1} flexDirection="row">
                          {user.role === 'help_seeker' ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleRoleUpgrade(user, 'admin')}
                              disabled={upgradeUserRoleMutation.isPending}
                              data-testid={`upgrade-to-admin-${user.id}`}
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                px: { xs: 1, sm: 1.5 },
                                py: { xs: 0.5, sm: 0.75 },
                              }}
                            >
                              Make Admin
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleRoleUpgrade(user, 'help_seeker')}
                              disabled={upgradeUserRoleMutation.isPending}
                              data-testid={`downgrade-to-help-seeker-${user.id}`}
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                px: { xs: 1, sm: 1.5 },
                                py: { xs: 0.5, sm: 0.75 },
                              }}
                            >
                              Remove Admin
                            </Button>
                          )}
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
        <Box display="flex" justifyContent="center" mt={{ xs: 2, sm: 3 }} sx={{ overflowX: 'auto' }}>
          <Pagination
            count={Math.ceil((usersData.data?.total || 0) / limit)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
              },
            }}
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
            disabled={updateUserStatusMutation.isPending}
            data-testid="cancel-action-button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void confirmAction()}
            variant="contained"
            color={actionDialog.action === 'flag' ? 'error' : undefined}
            disabled={updateUserStatusMutation.isPending}
            data-testid="confirm-action-button"
            sx={
              actionDialog.action === 'verify'
                ? {
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                    },
                  }
                : undefined
            }
          >
            {updateUserStatusMutation.isPending ? (
              <CircularProgress size={20} />
            ) : actionDialog.action === 'verify' ? (
              'Verify'
            ) : (
              'Flag'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Upgrade Confirmation Dialog */}
      <Dialog
        open={roleUpgradeDialog.open}
        onClose={() => setRoleUpgradeDialog({ open: false, user: null, newRole: null })}
        data-testid="role-upgrade-dialog"
      >
        <DialogTitle data-testid="role-upgrade-dialog-title">
          {roleUpgradeDialog.newRole === 'admin' ? 'Upgrade to Admin' : 'Remove Admin Role'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {roleUpgradeDialog.newRole === 'admin' ? 'upgrade' : 'remove admin role from'}{' '}
            {roleUpgradeDialog.user?.full_name}?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {roleUpgradeDialog.newRole === 'admin'
              ? 'This user will gain access to the admin dashboard and can verify/flag other users.'
              : 'This user will lose admin privileges and return to help seeker role.'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks (optional)"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            margin="normal"
            placeholder="Add any notes about this role change..."
            data-testid="role-upgrade-remarks-input"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRoleUpgradeDialog({ open: false, user: null, newRole: null })}
            disabled={upgradeUserRoleMutation.isPending}
            data-testid="cancel-role-upgrade-button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void confirmRoleUpgrade()}
            variant="contained"
            color={roleUpgradeDialog.newRole === 'admin' ? 'primary' : 'warning'}
            disabled={upgradeUserRoleMutation.isPending}
            data-testid="confirm-role-upgrade-button"
          >
            {upgradeUserRoleMutation.isPending ? (
              <CircularProgress size={20} />
            ) : roleUpgradeDialog.newRole === 'admin' ? (
              'Upgrade to Admin'
            ) : (
              'Remove Admin Role'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
