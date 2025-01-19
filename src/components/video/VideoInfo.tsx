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
  title, 
  channelName, 
  channelThumbnail,
  views,
  uploadedAt,
  description
}: VideoInfoProps) => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={channelThumbnail || ''} alt={channelName} />
            <AvatarFallback>{channelName[0]}</AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground">{channelName}</p>
        </div>
        <p className="text-muted-foreground">
          {views?.toLocaleString()} views •{" "}
          {formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}
        </p>
      </div>
      {description && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="whitespace-pre-wrap text-sm">{description}</p>
        </div>
      )}
    </>
  );
};