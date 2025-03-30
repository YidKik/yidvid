import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useEffect, useState } from "react";
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
  maxVideos?: number;
  rowSize?: number;
  className?: string;
}

export const VideoGrid = ({
  maxVideos = 12,
  rowSize = 4,
  className,
}: VideoGridProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [videosToDisplay, setVideosToDisplay] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .order("id", { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error fetching videos:", error);
          return;
        }

        if (data) {
          const shuffledVideos = data
            .sort(() => 0.5 - Math.random())
            .slice(0, maxVideos);
          setVideosToDisplay(shuffledVideos);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [maxVideos]); // Dependency ensures correct re-fetch behavior

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", isMobile ? "min-h-[200px]" : "min-h-[400px]")}>
        <LoadingAnimation size={isMobile ? "small" : "medium"} color="primary" text="Loading videos..." />
      </div>
    );
  }

  return (
    <div className={cn("grid", isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`, className)}>
      {videosToDisplay.length > 0 ? (
        videosToDisplay.map((video) => (
          <div key={video.id} className={cn("w-full flex flex-col", isMobile && "mb-2")}>
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
        ))
      ) : (
        <p className="text-center text-gray-500">No videos found.</p>
      )}
    </div>
  );
};

export default VideoGrid;



// import { cn } from "@/lib/utils";
// import { useIsMobile } from "@/hooks/use-mobile";
// import { VideoCard } from "./VideoCard";
// import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
// import { useEffect, useMemo } from "react";
// import { useLocation } from "react-router-dom";

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
//   videos: Video[];
//   maxVideos?: number;
//   rowSize?: number;
//   isLoading?: boolean;
//   className?: string;
// }

// export const VideoGrid = ({
//   videos,
//   maxVideos = 12,
//   rowSize = 4,
//   isLoading = false,
//   className,
// }: VideoGridProps) => {
//   const isMobile = useIsMobile();
//   const location = useLocation();
//   const isMainPage = location.pathname === "/";
  
//   // Memoize videos to prevent unnecessary re-renders
//   const displayVideos = useMemo(() => {
//     // Ensure we have valid videos to display (filter out invalid entries)
//     if (!videos || videos.length === 0) {
//       return [];
//     }
    
//     // Ensure all videos have required properties
//     const filteredVideos = videos.filter(v => 
//       v && v.title && v.video_id && (v.thumbnail || v.id.includes('sample'))
//     );
    
//     return filteredVideos.slice(0, maxVideos);
//   }, [videos, maxVideos]);
  
//   // Check if we're really loading or have no videos
//   const loading = isLoading || !videos || videos.length === 0;
  
//   // Log for debugging
//   useEffect(() => {
//     console.log(`VideoGrid rendering with ${displayVideos.length} videos, isLoading: ${isLoading}`);
//     if (displayVideos.length > 0) {
//       console.log("First video sample title:", displayVideos[0].title);
//     } else if (!isLoading) {
//       console.warn("VideoGrid has no videos to display");
//     }
//   }, [displayVideos, isLoading]);
  
//   // Dynamically determine grid columns based on rowSize and mobile status
//   const gridCols = isMobile ? "grid-cols-2" : `grid-cols-${rowSize}`;
  
//   // Better check for real videos vs sample videos
//   const hasRealVideos = displayVideos.some(v => 
//     !v.id.toString().includes('sample') && 
//     !v.video_id.includes('sample') &&
//     v.channelName !== "Sample Channel" &&
//     v.title !== "Sample Video 1"
//   );
  
//   // Create sample videos as fallback if needed
//   const createSampleVideos = () => {
//     const now = new Date();
//     return Array(maxVideos).fill(null).map((_, i) => ({
//       id: `sample-${i}`,
//       video_id: `sample-vid-${i}`,
//       title: `Sample Video ${i+1}`,
//       thumbnail: '/placeholder.svg',
//       channelName: "Sample Channel",
//       channelId: "sample-channel",
//       views: 1000 * (i+1),
//       uploadedAt: new Date(now.getTime() - (i * 86400000))
//     }));
//   };

//   // Always show some content even when loading on main page
//   const videosToDisplay = displayVideos.length > 0 
//     ? displayVideos 
//     : (hasRealVideos ? displayVideos : createSampleVideos());

//   // On main page, use a simpler loading indicator
//   if (loading && !isMainPage) {
//     return (
//       <div className={cn(
//         "flex items-center justify-center",
//         isMobile ? "min-h-[200px]" : "min-h-[400px]"
//       )}>
//         <LoadingAnimation
//           size={isMobile ? "small" : "medium"}
//           color="primary"
//           text="Loading videos..."
//         />
//       </div>
//     );
//   }

//   return (
//     <div className={cn(
//       "grid",
//       isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`,
//       className
//     )}>
//       {videosToDisplay.map((video) => (
//         <div 
//           key={video.id || `video-${Math.random()}`}
//           className={cn(
//             "w-full flex flex-col",
//             isMobile && "mb-2"
//           )}
//         >
//           <VideoCard 
//             id={video.id}
//             video_id={video.video_id}
//             title={video.title || "Untitled Video"}
//             thumbnail={video.thumbnail || "/placeholder.svg"}
//             channelName={video.channelName || "Unknown Channel"}
//             channelId={video.channelId}
//             views={video.views || 0}
//             uploadedAt={video.uploadedAt}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default VideoGrid;

// import { cn } from "@/lib/utils";
// import { useIsMobile } from "@/hooks/use-mobile";
// import { VideoCard } from "./VideoCard";
// import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
// import { useEffect, useMemo, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";

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
//   videos: Video[];
//   maxVideos?: number;
//   rowSize?: number;
//   isLoading?: boolean;
//   className?: string;
// }

// export const VideoGrid = ({
//   videos,
//   maxVideos = 4,
//   rowSize = 4,
//   isLoading = false,
//   className,
// }: VideoGridProps) => {
//   const isMobile = useIsMobile();
//   const location = useLocation();
//   const isMainPage = location.pathname === "/";

//   // Memoize videos to prevent unnecessary re-renders
//   const displayVideos = useMemo(() => {
//     // Ensure we have valid videos to display (filter out invalid entries)
//     if (!videos || videos.length === 0) {
//       return [];
//     }

//     // Ensure all videos have required properties
//     const filteredVideos = videos.filter(
//       (v) =>
//         v && v.title && v.video_id && (v.thumbnail || v.id.includes("sample"))
//     );

//     return filteredVideos.slice(0, maxVideos);
//   }, [videos, maxVideos]);

//   // Check if we're really loading or have no videos
//   // const loading = isLoading || !videos || videos.length === 0;

//   // Log for debugging
//   // useEffect(() => {
//   //   console.log(`VideoGrid rendering with ${displayVideos.length} videos, isLoading: ${isLoading}`);
//   //   if (displayVideos.length > 0) {
//   //     console.log("First video sample title:", displayVideos[0].title);
//   //   } else if (!isLoading) {
//   //     console.warn("VideoGrid has no videos to display");
//   //   }
//   // }, [displayVideos, isLoading]);

//   // Dynamically determine grid columns based on rowSize and mobile status
//   const gridCols = isMobile ? "grid-cols-2" : `grid-cols-${rowSize}`;

//   // Better check for real videos vs sample videos
//   const hasRealVideos = displayVideos.some(
//     (v) =>
//       !v.id.toString().includes("sample") &&
//       !v.video_id.includes("sample") &&
//       v.channelName !== "Sample Channel" &&
//       v.title !== "Sample Video 1"
//   );

//   // Create sample videos as fallback if needed
//   const createSampleVideos = () => {
//     const now = new Date();
//     return Array(maxVideos)
//       .fill(null)
//       .map((_, i) => ({
//         id: `sample-${i}`,
//         video_id: `sample-vid-${i}`,
//         title: `Sample Video ${i + 1}`,
//         thumbnail: "/placeholder.svg",
//         channelName: "Sample Channel",
//         channelId: "sample-channel",
//         views: 1000 * (i + 1),
//         uploadedAt: new Date(now.getTime() - i * 86400000),
//       }));
//   };

//   // Always show some content even when loading on main page
//   // const videosToDisplay = displayVideos.length > 0
//   //   ? displayVideos
//   //   : (hasRealVideos ? displayVideos : createSampleVideos());
//   const [videosToDisplay, setDisplayVideos] = useState([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//   const fetchVideos = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("youtube_videos")
//         .select("*")
//         .order("id", { ascending: false })
//         .limit(100);

//       if (error) {
//         console.error("Error fetching videos:", error);
//         return;
//       }

//       if (data) {
//         const shuffledVideos = data.sort(() => 0.5 - Math.random()).slice(0, 20);
//         setDisplayVideos(shuffledVideos); // Update state only if data changes
//       }
//     } catch (err) {
//       console.error("Unexpected error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchVideos();
// }, []); // <-- Empty dependency array ensures it runs only once


//   // useEffect(() => {
//   //   const fetchVideos = async () => {
//   //     setLoading(true);
//   //     const { data, error } = await supabase
//   //       .from("youtube_videos")
//   //       .select("*")
//   //       .order("id", { ascending: false }) // Get random rows
//   //       .limit(100); // Limit to 20 videos
//   //     console.warn(data)
//   //     if (error) {
//   //       console.error("Error fetching videos:", error);
//   //     } else {
//   //       const shuffledVideos = data.sort(() => 0.5 - Math.random()).slice(0, 20);
   
//   //       setDisplayVideos(shuffledVideos || []);
//   //     }
//   //     setLoading(false);
//   //   };

//   //   fetchVideos();
//   // }, []);
//   // On main page, use a simpler loading indicator
//   if (loading) {
//     return (
//       <div
//         className={cn(
//           "flex items-center justify-center",
//           isMobile ? "min-h-[200px]" : "min-h-[400px]"
//         )}
//       >
//         <LoadingAnimation
//           size={isMobile ? "small" : "medium"}
//           color="primary"
//           text="Loading videos..."
//         />
//       </div>
//     );
//   }

//   return (
//     <div
//       className={cn(
//         "grid",
//         isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`,
//         className
//       )}
//     >
//       {videosToDisplay.map((video) => (
//         <div
//           key={video.id || `video-${Math.random()}`}
//           className={cn("w-full flex flex-col", isMobile && "mb-2")}
//         >
//           <VideoCard
//             id={video.id}
//             video_id={video.video_id}
//             title={video.title || "Untitled Video"}
//             thumbnail={video.thumbnail || "/placeholder.svg"}
//             channelName={video.channelName || "Unknown Channel"}
//             channelId={video.channelId}
//             views={video.views || 0}
//             uploadedAt={video.uploadedAt}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default VideoGrid;
