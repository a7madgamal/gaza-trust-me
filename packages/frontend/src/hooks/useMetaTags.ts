import { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
}

export const useMetaTags = ({ title, description, url, imageUrl }: MetaTagsProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateNameMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update description
    updateNameMetaTag('description', description);

    // Open Graph / Facebook
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', url);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', imageUrl);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:site_name', 'GazaTrust.Me');

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', url);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);

    // Cleanup function to reset meta tags when component unmounts
    return () => {
      document.title = 'GazaTrust.Me';
      // Remove the meta tags we added
      const metaTags = document.querySelectorAll(
        'meta[property^="og:"], meta[property^="twitter:"], meta[name="description"]'
      );
      metaTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [title, description, url, imageUrl]);
};
