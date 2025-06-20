
import { useEffect } from 'react';
import { VideoData } from "@/hooks/video/types/video-fetcher";

interface SitemapGeneratorProps {
  videos: VideoData[];
}

export const SitemapGenerator = ({ videos }: SitemapGeneratorProps) => {
  useEffect(() => {
    // Generate sitemap data
    const generateSitemap = () => {
      const baseUrl = window.location.origin;
      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/videos', priority: '0.9', changefreq: 'daily' },
        { url: '/auth', priority: '0.5', changefreq: 'monthly' },
        { url: '/settings', priority: '0.3', changefreq: 'monthly' }
      ];
      
      const videoPages = videos.map(video => ({
        url: `/video/${video.video_id}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: new Date(video.uploaded_at || Date.now()).toISOString().split('T')[0]
      }));
      
      const allPages = [...staticPages, ...videoPages];
      
      // Store sitemap data in sessionStorage for potential use
      sessionStorage.setItem('sitemapData', JSON.stringify(allPages));
      
      console.log('Sitemap data generated for', allPages.length, 'pages');
    };
    
    if (videos.length > 0) {
      generateSitemap();
    }
  }, [videos]);
  
  return null; // This component doesn't render anything
};
