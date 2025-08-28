import React from 'react';
import { Chip, Link } from '@mui/material';
import { Verified } from '@mui/icons-material';
import { trpc } from '../../utils/trpc';

interface VerificationBadgeProps {
  verifiedBy: string | null;
  status: string | null;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verifiedBy, status }) => {
  const { data: adminData } = trpc.getAdminProfile.useQuery(
    { adminId: verifiedBy },
    {
      enabled: !!verifiedBy && status === 'verified',
    }
  );

  // Only show badge if status is verified and we have admin data
  if (status !== 'verified' || !verifiedBy || !adminData?.data) {
    return null;
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
      data-testid="verification-badge"
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
