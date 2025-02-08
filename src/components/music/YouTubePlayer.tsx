
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface YouTubePlayerProps {
  audioUrl: string;
  thumbnail: string;
  title: string;
  onPlayStateChange: (isPlaying: boolean) => void;
}

export const YouTubePlayer = ({ audioUrl, thumbnail, title, onPlayStateChange }: YouTubePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlay = () => {
    if (!audioUrl) {
      toast.error("No audio URL available for this track");
      return;
    }

    // Extract video ID from YouTube URL
    const videoId = audioUrl.split('v=')[1];
    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    // Create or update iframe for YouTube embed
    if (iframeRef.current) {
      if (!isPlaying) {
        iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } else {
        iframeRef.current.src = '';
      }
      setIsPlaying(!isPlaying);
      onPlayStateChange(!isPlaying);
    }
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black relative">
        {isPlaying ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="mt-4 flex items-center gap-4 p-4 bg-muted rounded-lg">
        <Button
          onClick={handlePlay}
          size="icon"
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{title}</h2>
        </div>
      </div>
    </div>
  );
};
