
import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";

interface VideoCardThumbnailProps {
  thumbnail: string;
  title: string;
  isSample: boolean;
}

export const VideoCardThumbnail = ({ thumbnail, title, isSample }: VideoCardThumbnailProps) => {
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-muted/30">
      <div className="aspect-video w-full overflow-hidden">
        {isSample || !thumbnail ? (
          <VideoPlaceholder size="small" />
        ) : (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105 thumbnail-slide-up"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.parentElement!.innerHTML = `
                <div class="h-full w-full flex items-center justify-center">
                  <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="${title}" class="h-32 w-auto" />
                </div>
              `;
            }}
          />
        )}
      </div>
    </div>
  );
};
