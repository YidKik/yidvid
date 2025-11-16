import { VideoData } from "@/hooks/video/types/video-fetcher";

interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

export const generateSitemapXML = (videos: VideoData[]): string => {
  const baseUrl = 'https://yidvid.co';
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Static pages
  const staticPages: SitemapUrl[] = [
    { url: '/', lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
    { url: '/videos', lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
    { url: '/auth', lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
    { url: '/settings', lastmod: currentDate, changefreq: 'monthly', priority: '0.3' }
  ];
  
  // Video pages
  const videoPages: SitemapUrl[] = videos.map(video => ({
    url: `/video/${video.video_id}`,
    lastmod: video.uploaded_at 
      ? new Date(video.uploaded_at).toISOString().split('T')[0] 
      : currentDate,
    changefreq: 'weekly',
    priority: '0.8'
  }));
  
  const allPages = [...staticPages, ...videoPages];
  
  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
  xml += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';
  
  allPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    if (page.lastmod) {
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    }
    if (page.changefreq) {
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    }
    if (page.priority) {
      xml += `    <priority>${page.priority}</priority>\n`;
    }
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

export const downloadSitemap = (videos: VideoData[]) => {
  const xml = generateSitemapXML(videos);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getSitemapStats = (videos: VideoData[]) => {
  return {
    totalUrls: videos.length + 4, // 4 static pages + video pages
    staticPages: 4,
    videoPages: videos.length,
    lastGenerated: new Date().toISOString()
  };
};
