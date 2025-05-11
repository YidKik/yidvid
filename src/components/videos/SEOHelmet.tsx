
import { Helmet } from "react-helmet";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";

interface SEOHelmetProps {
  videos: VideoData[] | null;
  path: string;
}

export const SEOHelmet = ({ videos, path }: SEOHelmetProps) => {
  // Generate enhanced SEO content
  const seoKeywords = videos && videos.length > 0
    ? videos.slice(0, 10)
        .map(v => [v.title, v.channelName])
        .flat()
        .concat(["Jewish videos", "Yiddish videos", "kosher content", "Torah videos"]).join(", ")
    : DEFAULT_META_KEYWORDS;

  const seoDescription = `Browse our collection of Jewish videos including lectures, music, Torah videos and more. YidVid is your premier platform for kosher content from trusted Jewish sources.`;
  
  // Generate structured data
  const structuredData = videos && videos.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": videos.slice(0, 10).map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "VideoObject",
        "name": video.title,
        "description": `${video.title} - Jewish video content from ${video.channelName}`,
        "thumbnailUrl": video.thumbnail,
        "uploadDate": video.uploadedAt ? new Date(video.uploadedAt).toISOString() : new Date().toISOString(),
        "contentUrl": `https://yidvid.com/video/${video.id}`
      }
    }))
  } : null;

  return (
    <Helmet>
      <title>{getPageTitle(path)}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta property="og:title" content={getPageTitle(path)} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={DEFAULT_META_IMAGE} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={getPageTitle(path)} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={DEFAULT_META_IMAGE} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={window.location.origin + "/videos"} />
      <link rel="icon" href="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
