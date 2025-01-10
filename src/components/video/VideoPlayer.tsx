interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  return (
    <div className="aspect-video w-full mb-4">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};