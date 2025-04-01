
import { PlayerContainer } from "./player/PlayerContainer";

interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  return <PlayerContainer videoId={videoId} />;
};
