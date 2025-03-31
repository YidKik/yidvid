import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number | null;
  uploadedAt: string | Date;
}

interface VideoGridProps {
  videos: Video[];
  maxVideos?: number;
  rowSize?: number;
  isLoading?: boolean;
  className?: string;
}

export const VideoGrid = ({
  videos,
  maxVideos = 12,
  rowSize = 4,
  isLoading = false,
  className,
}: VideoGridProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  // Memoize videos to prevent unnecessary re-renders
  const displayVideos = useMemo(() => {
    // Ensure we have valid videos to display (filter out invalid entries)
    if (!videos || videos.length === 0) {
      return [];
    }

    // Ensure all videos have required properties
    const filteredVideos = videos.filter(
      (v) =>
        v && v.title && v.video_id && (v.thumbnail || v.id.includes("sample"))
    );

    return filteredVideos.slice(0, maxVideos);
  }, [videos, maxVideos]);

  // Check if we're really loading or have no videos
  // const loading = isLoading || !videos || videos.length === 0;

  // Log for debugging
  // useEffect(() => {
  //   console.log(`VideoGrid rendering with ${displayVideos.length} videos, isLoading: ${isLoading}`);
  //   if (displayVideos.length > 0) {
  //     console.log("First video sample title:", displayVideos[0].title);
  //   } else if (!isLoading) {
  //     console.warn("VideoGrid has no videos to display");
  //   }
  // }, [displayVideos, isLoading]);

  // Dynamically determine grid columns based on rowSize and mobile status
  const gridCols = isMobile ? "grid-cols-2" : `grid-cols-${rowSize}`;

  // Better check for real videos vs sample videos
  const hasRealVideos = displayVideos.some(
    (v) =>
      !v.id.toString().includes("sample") &&
      !v.video_id.includes("sample") &&
      v.channelName !== "Sample Channel" &&
      v.title !== "Sample Video 1"
  );

  // Create sample videos as fallback if needed
  const createSampleVideos = () => {
    const now = new Date();
    return Array(maxVideos)
      .fill(null)
      .map((_, i) => ({
        id: `sample-${i}`,
        video_id: `sample-vid-${i}`,
        title: `Sample Video ${i + 1}`,
        thumbnail: "/placeholder.svg",
        channelName: "Sample Channel",
        channelId: "sample-channel",
        views: 1000 * (i + 1),
        uploadedAt: new Date(now.getTime() - i * 86400000),
      }));
  };

  // Always show some content even when loading on main page
  // const videosToDisplay = displayVideos.length > 0
  //   ? displayVideos
  //   : (hasRealVideos ? displayVideos : createSampleVideos());
  const [videosToDisplay, setDisplayVideos] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("id", { ascending: false }) // Get random rows
        .limit(100); // Limit to 20 videos
      console.warn(data)
      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        const shuffledVideos = data.sort(() => 0.5 - Math.random()).slice(0, 20);
   
        setDisplayVideos(shuffledVideos || []);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);
  // On main page, use a simpler loading indicator
  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          isMobile ? "min-h-[200px]" : "min-h-[400px]"
        )}
      >
        <LoadingAnimation
          size={isMobile ? "small" : "medium"}
          color="primary"
          text="Loading videos..."
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid",
        isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`,
        className
      )}
    >
      {videosToDisplay.map((video) => (
        <div
          key={video.id || `video-${Math.random()}`}
          className={cn("w-full flex flex-col", isMobile && "mb-2")}
        >
          <VideoCard
            id={video.id}
            video_id={video.video_id}
            title={video.title || "Untitled Video"}
            thumbnail={video.thumbnail || "/placeholder.svg"}
            channelName={video.channelName || "Unknown Channel"}
            channelId={video.channelId}
            views={video.views || 0}
            uploadedAt={video.uploadedAt}
          />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;


// import { cn } from "@/lib/utils";
// import { useIsMobile } from "@/hooks/use-mobile";
// import { VideoCard } from "./VideoCard";
// import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
// import { useEffect, useState, useRef } from "react";
// import { useLocation } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { VideoData } from "@/hooks/video/types/video-fetcher";

// interface Video {
//   id: string;
//   video_id: string;
//   title: string;
//   thumbnail: string;
//   channelName: string;
//   channelId: string;
//   views: number | null;
//   uploadedAt: string | Date;
// }

// interface VideoGridProps {
//   videos?: VideoData[];
//   maxVideos?: number;
//   rowSize?: number;
//   className?: string;
//   isLoading?: boolean;
// }

// export const VideoGrid = ({
//   videos,
//   maxVideos = 12,
//   rowSize = 4,
//   className,
//   isLoading = false,
// }: VideoGridProps) => {
//   const { isMobile } = useIsMobile();
//   const location = useLocation();
//   const [videosToDisplay, setVideosToDisplay] = useState<Video[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [visibleVideos, setVisibleVideos] = useState<Video[]>([]);
//   const gridRef = useRef<HTMLDivElement>(null);
  
//   useEffect(() => {
//     if (!gridRef.current || videosToDisplay.length === 0) return;
    
//     const options = {
//       root: null,
//       rootMargin: '200px',
//       threshold: 0.1
//     };
    
//     const videoElements = gridRef.current.querySelectorAll('.video-card-container');
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           const videoId = entry.target.getAttribute('data-video-id');
//           if (videoId) {
//             const video = videosToDisplay.find(v => v.id === videoId);
//             if (video) {
//               setVisibleVideos(prev => {
//                 if (!prev.some(v => v.id === video.id)) {
//                   return [...prev, video];
//                 }
//                 return prev;
//               });
//             }
            
//             observer.unobserve(entry.target);
//           }
//         }
//       });
//     }, options);
    
//     videoElements.forEach(element => {
//       observer.observe(element);
//     });
    
//     return () => {
//       observer.disconnect();
//     };
//   }, [videosToDisplay]);

//   useEffect(() => {
//     if (videos && videos.length > 0) {
//       const formattedVideos = videos.map(video => {
//         let validatedDate: string | Date;
//         try {
//           if (video.uploadedAt) {
//             if (video.uploadedAt instanceof Date) {
//               if (!isNaN(video.uploadedAt.getTime())) {
//                 validatedDate = video.uploadedAt;
//               } else {
//                 validatedDate = new Date().toISOString();
//               }
//             } else {
//               const testDate = new Date(video.uploadedAt);
//               if (!isNaN(testDate.getTime())) {
//                 validatedDate = video.uploadedAt;
//               } else {
//                 validatedDate = new Date().toISOString();
//               }
//             }
//           } else {
//             validatedDate = new Date().toISOString();
//           }
//         } catch (err) {
//           console.error("Date validation error:", err);
//           validatedDate = new Date().toISOString();
//         }

//         return {
//           id: video.id,
//           video_id: video.video_id,
//           title: video.title || "Untitled Video",
//           thumbnail: video.thumbnail || "/placeholder.svg",
//           channelName: video.channelName || "Unknown Channel",
//           channelId: video.channelId,
//           views: video.views || 0,
//           uploadedAt: validatedDate
//         };
//       });

//       setVideosToDisplay(formattedVideos);
      
//       const initialVisibleCount = Math.min(formattedVideos.length, isMobile ? 4 : 8);
//       setVisibleVideos(formattedVideos.slice(0, initialVisibleCount));
      
//       setLoading(false);
//       return;
//     }

//     const fetchVideos = async () => {
//       setLoading(true);
//       try {
//         const initialLimit = isMobile ? 4 : 12;
        
//         const { data, error } = await supabase
//           .from("youtube_videos")
//           .select("*")
//           .order("id", { ascending: false })
//           .limit(initialLimit);

//         if (error) {
//           console.error("Error fetching videos:", error);
//           return;
//         }

//         if (data) {
//           const processedData = data.map(video => {
//             let validUploadedAt: string;
//             try {
//               if (video.uploaded_at) {
//                 const testDate = new Date(video.uploaded_at);
//                 validUploadedAt = !isNaN(testDate.getTime()) 
//                   ? video.uploaded_at 
//                   : new Date().toISOString();
//               } else {
//                 validUploadedAt = new Date().toISOString();
//               }
//             } catch (err) {
//               console.error("Date processing error:", err);
//               validUploadedAt = new Date().toISOString();
//             }

//             return {
//               id: video.id,
//               video_id: video.video_id,
//               title: video.title || "Untitled Video",
//               thumbnail: video.thumbnail || "/placeholder.svg",
//               channelName: video.channel_name || "Unknown Channel",
//               channelId: video.channel_id,
//               views: video.views || 0,
//               uploadedAt: validUploadedAt
//             };
//           });
          
//           setVideosToDisplay(processedData);
//           setVisibleVideos(processedData);
          
//           setTimeout(() => {
//             fetchMoreVideos(initialLimit);
//           }, 2000);
//         }
//       } catch (err) {
//         console.error("Unexpected error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     const fetchMoreVideos = async (initialLimit: number) => {
//       try {
//         const { data, error } = await supabase
//           .from("youtube_videos")
//           .select("*")
//           .order("id", { ascending: false })
//           .range(initialLimit, initialLimit + 88);

//         if (error) {
//           console.error("Error fetching more videos:", error);
//           return;
//         }

//         if (data && data.length > 0) {
//           const processedData = data.map(video => {
//             let validUploadedAt: string;
//             try {
//               if (video.uploaded_at) {
//                 const testDate = new Date(video.uploaded_at);
//                 validUploadedAt = !isNaN(testDate.getTime()) 
//                   ? video.uploaded_at 
//                   : new Date().toISOString();
//               } else {
//                 validUploadedAt = new Date().toISOString();
//               }
//             } catch (err) {
//               console.error("Date processing error:", err);
//               validUploadedAt = new Date().toISOString();
//             }

//             return {
//               id: video.id,
//               video_id: video.video_id,
//               title: video.title || "Untitled Video",
//               thumbnail: video.thumbnail || "/placeholder.svg",
//               channelName: video.channel_name || "Unknown Channel",
//               channelId: video.channel_id,
//               views: video.views || 0,
//               uploadedAt: validUploadedAt
//             };
//           });
          
//           setVideosToDisplay(prev => [...prev, ...processedData]);
//           console.log(`Loaded ${processedData.length} additional videos in the background`);
//         }
//       } catch (err) {
//         console.error("Error in background fetch:", err);
//       }
//     };

//     fetchVideos();
//   }, [videos, maxVideos, isMobile]);

//   if (isLoading || loading) {
//     return (
//       <div className={cn("flex items-center justify-center", isMobile ? "min-h-[200px]" : "min-h-[400px]")}>
//         <LoadingAnimation size={isMobile ? "small" : "medium"} color="primary" text="Loading videos..." />
//       </div>
//     );
//   }

//   return (
//     <div ref={gridRef} className={cn("grid", isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`, className)}>
//       {videosToDisplay.length > 0 ? (
//         videosToDisplay.map((video) => (
//           <div 
//             key={video.id} 
//             className={cn("w-full flex flex-col video-card-container", isMobile && "mb-2")}
//             data-video-id={video.id}
//           >
//             <VideoCard
//               id={video.id}
//               video_id={video.video_id}
//               title={video.title || "Untitled Video"}
//               thumbnail={video.thumbnail || "/placeholder.svg"}
//               channelName={video.channelName || "Unknown Channel"}
//               channelId={video.channelId}
//               views={video.views || 0}
//               uploadedAt={video.uploadedAt}
//               isLazy={!visibleVideos.some(v => v.id === video.id)}
//             />
//           </div>
//         ))
//       ) : (
//         <p className="text-center text-gray-500">No videos found.</p>
//       )}
//     </div>
//   );
// };

// export default VideoGrid;
