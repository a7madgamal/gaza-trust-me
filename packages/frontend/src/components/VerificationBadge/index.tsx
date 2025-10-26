import React from 'react';
import { Chip, Link } from '@mui/material';
import { Verified } from '@mui/icons-material';

interface VerificationBadgeProps {
  verifiedBy: string;
  verifiedByAdmin: { full_name: string };
  status: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verifiedBy, verifiedByAdmin, status }) => {
  // CRASH HARD - no fallbacks, verified users MUST have admin data
  if (status !== 'verified') {
    throw new Error(`VerificationBadge: Expected status 'verified', got '${status}'`);
  }

  if (!verifiedBy) {
    throw new Error('VerificationBadge: verifiedBy is required for verified users');
  }

  if (!verifiedByAdmin?.full_name) {
    throw new Error('VerificationBadge: verifiedByAdmin.full_name is required for verified users');
  }

  return (
    <Chip
      icon={<Verified sx={{ color: 'white !important' }} />}
      label={
        <Link
          href={`/admins/${verifiedBy}`}
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
          Verified by {verifiedByAdmin.full_name}
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
