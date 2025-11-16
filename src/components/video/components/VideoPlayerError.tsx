
import { useNavigate } from "react-router-dom";
import { VideoPlaceholder } from "../VideoPlaceholder";

export const VideoPlayerError = () => {
  const navigate = useNavigate();

  return (
    <div className="aspect-video w-full mb-4 relative">
      <VideoPlaceholder size="large" />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <button 
          onClick={() => navigate("/videos")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Return to Videos
        </button>
      </div>
    </div>
  );
};
