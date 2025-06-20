
import { VideoData } from "@/hooks/video/types/video-fetcher";

// SEO Keywords and optimization utilities
export const generateVideoKeywords = (video: VideoData): string => {
  const baseKeywords = [
    "Jewish videos",
    "Jewish content",
    "Torah videos",
    "Jewish education",
    "Jewish lectures",
    "Jewish media",
    "Jewish learning",
    "Torah study"
  ];
  
  // Extract keywords from title and channel
  const titleWords = video.title?.toLowerCase().split(' ').filter(word => 
    word.length > 3 && !['the', 'and', 'for', 'with', 'from'].includes(word)
  ) || [];
  
  const channelWords = video.channel_name?.toLowerCase().split(' ').filter(word => 
    word.length > 3
  ) || [];
  
  // Combine and deduplicate keywords
  const allKeywords = [...baseKeywords, ...titleWords, ...channelWords];
  return [...new Set(allKeywords)].join(', ');
};

export const generateVideoMetaTitle = (video: VideoData): string => {
  const title = video.title || 'Jewish Video';
  const channel = video.channel_name || 'YidVid';
  return `${title} | ${channel} | YidVid - Jewish Video Platform`;
};

export const generateVideoMetaDescription = (video: VideoData): string => {
  const title = video.title || 'Jewish Video';
  const channel = video.channel_name || 'Unknown Channel';
  const views = video.views || 0;
  
  let description = `Watch "${title}" by ${channel} on YidVid - Your premier Jewish video platform. `;
  
  if (video.description) {
    const shortDesc = video.description.substring(0, 100);
    description += `${shortDesc}... `;
  }
  
  description += `Join ${views.toLocaleString()} viewers and explore our curated collection of Jewish content, Torah videos, and educational media.`;
  
  return description.substring(0, 160); // Keep under 160 characters for SEO
};

export const generateVideoSchema = (video: VideoData, pageUrl: string) => {
  const uploadDate = video.uploaded_at ? new Date(video.uploaded_at).toISOString() : new Date().toISOString();
  
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title || "Jewish Video",
    "description": video.description || generateVideoMetaDescription(video),
    "thumbnailUrl": video.thumbnail || "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png",
    "uploadDate": uploadDate,
    "duration": "PT0M0S", // You might want to fetch actual duration
    "embedUrl": `https://www.youtube-nocookie.com/embed/${video.video_id}`,
    "url": pageUrl,
    "publisher": {
      "@type": "Organization",
      "name": "YidVid",
      "logo": {
        "@type": "ImageObject",
        "url": "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
      }
    },
    "author": {
      "@type": "Person",
      "name": video.channel_name || "YidVid"
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.views || 0
    },
    "genre": "Education",
    "inLanguage": "en",
    "isFamilyFriendly": true,
    "keywords": generateVideoKeywords(video)
  };
};

export const generateBreadcrumbSchema = (video: VideoData) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "/"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Videos",
        "item": "/videos"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": video.title || "Video",
        "item": window.location.href
      }
    ]
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "YidVid",
    "description": "Your Premier Jewish Video Platform - Watch, Share, and Connect with curated Jewish content",
    "url": "https://yidvid.com",
    "logo": "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png",
    "sameAs": [
      // Add your social media URLs here when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };
};
