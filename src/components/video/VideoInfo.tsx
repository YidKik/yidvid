
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface VideoInfoProps {
  title: string;
  channelName: string;
  channelThumbnail?: string;
  views?: number;
  uploadedAt: string;
  description?: string;
}

export const VideoInfo = ({ 
  channelName, 
  channelThumbnail,
  description
}: VideoInfoProps) => {
  console.log("VideoInfo received props:", {
    channelName,
    channelThumbnail,
    description
  });

  return (
    <div className="space-y-2 md:space-y-4">
      <div className="flex items-center gap-1 md:gap-2">
        <Avatar className="h-6 w-6 md:h-10 md:w-10">
          <AvatarImage src={channelThumbnail || ''} alt={channelName} />
          <AvatarFallback>{channelName[0]}</AvatarFallback>
        </Avatar>
        <p className="text-xs md:text-base text-muted-foreground">{channelName}</p>
      </div>
      {description && (
        <div className="mt-2 md:mt-4 p-2 md:p-4 bg-muted rounded-lg">
          <p className="whitespace-pre-wrap text-[10px] md:text-sm">{description}</p>
        </div>
      )}
    </div>
  );
};
