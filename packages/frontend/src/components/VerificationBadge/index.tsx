import React from 'react';
import { Chip, Link } from '@mui/material';
import { Verified } from '@mui/icons-material';
import { trpc } from '../../utils/trpc';

interface VerificationBadgeProps {
  verifiedBy: string | null;
  status: string | null;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verifiedBy, status }) => {
  // If status is verified but no verifiedBy, this is an invalid state
  if (status === 'verified' && !verifiedBy) {
    return (
      <Chip
        label="Invalid Verification"
        color="error"
        size="small"
        sx={{
          backgroundColor: 'rgba(255,0,0,0.2)',
          color: 'white',
          fontWeight: 'bold',
        }}
      />
    );
  }

  const { data: adminData, isLoading } = trpc.getAdminProfile.useQuery(
    { adminId: verifiedBy },
    {
      enabled: !!verifiedBy && status === 'verified',
    }
  );

  if (status !== 'verified') {
    return (
      <Chip
        label={status || 'Unknown'}
        color="default"
        size="small"
        sx={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'white',
          fontWeight: 'bold',
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <Chip
        icon={<Verified sx={{ color: 'white !important' }} />}
        label="Verified"
        color="success"
        size="small"
        sx={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          fontWeight: 'bold',
          '& .MuiChip-icon': {
            color: 'white',
          },
        }}
      />
    );
  }

  if (!adminData?.data) {
    return (
      <Chip
        icon={<Verified sx={{ color: 'white !important' }} />}
        label="Verified"
        color="success"
        size="small"
        sx={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          fontWeight: 'bold',
          '& .MuiChip-icon': {
            color: 'white',
          },
        }}
      />
    );
  }

  const admin = adminData.data;

  return (
    <Chip
      icon={<Verified sx={{ color: 'white !important' }} />}
      label={
        <Link
          href={`/admins/${admin.id}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Verified by {admin.full_name}
        </Link>
      }
      color="success"
      size="small"
      sx={{
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: 'white',
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: 'white',
        },
        '& .MuiChip-label': {
          display: 'flex',
          alignItems: 'center',
        },
      }}
    />
  );
};

export default VerificationBadge;
