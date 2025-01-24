import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelThumbnail?: string;
  views?: number;
  uploadedAt: string;
}

export const VideoCard = ({
  id,
  title,
  thumbnail,
  channelName,
  channelThumbnail,
  views,
  uploadedAt,
}: VideoCardProps) => {
  return (
    <Link to={`/video/${id}`} className="block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md shadow-sm">
        <div className="aspect-video relative">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={channelThumbnail} />
              <AvatarFallback>{channelName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium line-clamp-2">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{channelName}</p>
              <p className="text-sm text-muted-foreground">
                {views?.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};