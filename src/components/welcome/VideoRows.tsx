
import React from "react";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { VideoRow } from "./VideoRow";

export const VideoRows: React.FC = () => {
  // Fetch videos for each row - we'll use different batches
  const { videos: allVideos, loading } = useVideoGridData(30); // Get enough videos for all rows
  
  // Separate videos into three groups for the different rows
  const firstRowVideos = allVideos.slice(0, 10);
  const secondRowVideos = allVideos.slice(10, 20);
  const thirdRowVideos = allVideos.slice(20, 30);
  
  // Direction, speed (in seconds for full animation cycle), and vertical spacing for each row
  const rowConfigs = [
    { videos: firstRowVideos, direction: "leftToRight", speed: 35, marginTop: 0 },
    { videos: secondRowVideos, direction: "rightToLeft", speed: 40, marginTop: 20 },
    { videos: thirdRowVideos, direction: "leftToRight", speed: 45, marginTop: 20 }
  ];

  return (
    <div className="w-full overflow-hidden">
      {rowConfigs.map((config, index) => (
        <div 
          key={`video-row-${index}`} 
          style={{ marginTop: config.marginTop }}
          className="w-full"
        >
          <VideoRow 
            videos={config.videos}
            direction={config.direction as "leftToRight" | "rightToLeft"}
            speed={config.speed}
            loading={loading}
          />
        </div>
      ))}
    </div>
  );
};
