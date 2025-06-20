
import { Helmet } from "react-helmet";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { 
  generateVideoMetaTitle, 
  generateVideoMetaDescription, 
  generateVideoKeywords,
  generateVideoSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema
} from "@/utils/seo";

interface VideoSEOProps {
  video: VideoData;
  pageUrl?: string;
}

export const VideoSEO = ({ video, pageUrl }: VideoSEOProps) => {
  const currentUrl = pageUrl || window.location.href;
  const metaTitle = generateVideoMetaTitle(video);
  const metaDescription = generateVideoMetaDescription(video);
  const keywords = generateVideoKeywords(video);
  
  const videoSchema = generateVideoSchema(video, currentUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(video);
  const organizationSchema = generateOrganizationSchema();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="YidVid" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="video.other" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={video.thumbnail || "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"} />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="720" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="YidVid" />
      <meta property="og:locale" content="en_US" />
      
      {/* Video-specific Open Graph */}
      <meta property="og:video" content={`https://www.youtube-nocookie.com/embed/${video.video_id}`} />
      <meta property="og:video:type" content="text/html" />
      <meta property="og:video:width" content="1280" />
      <meta property="og:video:height" content="720" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="player" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={video.thumbnail || "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"} />
      <meta name="twitter:player" content={`https://www.youtube-nocookie.com/embed/${video.video_id}`} />
      <meta name="twitter:player:width" content="1280" />
      <meta name="twitter:player:height" content="720" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="msapplication-TileColor" content="#1a1a1a" />
      <meta name="application-name" content="YidVid" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(videoSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
};
