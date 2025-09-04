import React, { useState } from 'react';
import { Tooltip, Snackbar, Alert, IconButton, Paper, Typography, Stack } from '@mui/material';
import { ContentCopy, WhatsApp, Facebook, Twitter, LinkedIn, Email } from '@mui/icons-material';

interface SharingWidgetProps {
  url: string;
  title: string;
  description: string;
}

const SharingWidget: React.FC<SharingWidgetProps> = ({ url, title, description }) => {
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false);

  // Don't render if we don't have a valid URL
  if (!url) {
    return null;
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedSnackbar(true);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopiedSnackbar(true);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Help this confirmed person in Gaza\n\n${title}\n\n${description}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    // Facebook supports quote parameter for pre-filling text
    const text = `Help this confirmed person in Gaza\n\n${title}\n\n${description}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const text = `Help this confirmed person in Gaza\n\n${title}\n\n${description}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    // LinkedIn sharing - use the correct URL format
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = `Help this confirmed person in Gaza: ${title}`;
    const body = `Hi,\n\nHelp this confirmed person in Gaza:\n\n${title}\n\n${description}\n\nView the profile here: ${url}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  return (
    <>
      <Paper
        elevation={{ xs: 0, sm: 1, md: 2 }}
        sx={{
          p: { xs: 1, md: 2 },
          background: {
            xs: 'transparent',
            sm: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          },
          border: {
            xs: 'none',
            sm: '1px solid rgba(255,255,255,0.1)',
          },
          backdropFilter: {
            xs: 'none',
            sm: 'blur(10px)',
          },
          borderRadius: {
            xs: 0,
            sm: 1,
            md: 1,
          },
          minWidth: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="body2"
          gutterBottom
          sx={{
            color: 'white',
            mb: 2,
            textAlign: { xs: 'center', md: 'center' },
            display: { xs: 'none', md: 'block' },
          }}
        >
          Share
        </Typography>

        {/* Descriptive text - responsive orientation */}
        <Typography
          variant="caption"
          sx={{
            color: {
              xs: 'rgba(0, 0, 0, 0.8)', // Darker text for light background on small screens
              sm: 'rgba(0, 0, 0, 0.8)', // Darker text for light background on small screens
              md: 'rgba(0, 0, 0, 0.8)', // Dark text for all backgrounds on large screens
            },
            fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.65rem' },
            textAlign: 'center',
            maxWidth: { xs: '200px', md: '50px' },
            lineHeight: 1.2,
            mb: { xs: 2, sm: 2, md: 2 }, // Increased spacing on all screen sizes
            display: 'block', // Always show on all screen sizes
            textShadow: { xs: 'none', sm: 'none', md: '0 0 2px rgba(255, 255, 255, 0.8)' }, // White glow on large screens
          }}
        >
          Share user's profile to help him survive
        </Typography>

        <Stack
          direction={{ xs: 'row', md: 'column' }}
          spacing={1}
          justifyContent="center"
          alignItems="center"
          flexWrap={{ xs: 'wrap', md: 'nowrap' }}
        >
          {/* Copy Link */}
          <Tooltip title="Copy link">
            <IconButton
              onClick={() => void handleCopyLink()}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>

          {/* WhatsApp */}
          <Tooltip title="Share on WhatsApp">
            <IconButton
              onClick={handleWhatsAppShare}
              sx={{
                color: 'white',
                backgroundColor: '#25D366',
                border: '1px solid #25D366',
                '&:hover': {
                  backgroundColor: '#128C7E',
                  borderColor: '#128C7E',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <WhatsApp />
            </IconButton>
          </Tooltip>

          {/* Facebook */}
          <Tooltip title="Share on Facebook">
            <IconButton
              onClick={handleFacebookShare}
              sx={{
                color: 'white',
                backgroundColor: '#1877F2',
                border: '1px solid #1877F2',
                '&:hover': {
                  backgroundColor: '#166FE5',
                  borderColor: '#166FE5',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Facebook />
            </IconButton>
          </Tooltip>

          {/* Twitter */}
          <Tooltip title="Share on Twitter">
            <IconButton
              onClick={handleTwitterShare}
              sx={{
                color: 'white',
                backgroundColor: '#1DA1F2',
                border: '1px solid #1DA1F2',
                '&:hover': {
                  backgroundColor: '#1A91DA',
                  borderColor: '#1A91DA',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Twitter />
            </IconButton>
          </Tooltip>

          {/* LinkedIn */}
          <Tooltip title="Share on LinkedIn">
            <IconButton
              onClick={handleLinkedInShare}
              sx={{
                color: 'white',
                backgroundColor: '#0077B5',
                border: '1px solid #0077B5',
                '&:hover': {
                  backgroundColor: '#005885',
                  borderColor: '#005885',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <LinkedIn />
            </IconButton>
          </Tooltip>

          {/* Email */}
          <Tooltip title="Share via Email">
            <IconButton
              onClick={handleEmailShare}
              sx={{
                color: 'white',
                backgroundColor: '#EA4335',
                border: '1px solid #EA4335',
                '&:hover': {
                  backgroundColor: '#D33426',
                  borderColor: '#D33426',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Email />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      <Snackbar
        open={showCopiedSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowCopiedSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowCopiedSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default SharingWidget;
