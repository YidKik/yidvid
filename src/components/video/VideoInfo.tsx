
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  description,
  views,
  uploadedAt
}: VideoInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(uploadedAt), { addSuffix: true });
  const formattedViews = views?.toLocaleString() || "0";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-background shadow-lg">
            <AvatarImage src={channelThumbnail || ''} alt={channelName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {channelName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-medium text-sm md:text-base">{channelName}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formattedViews} views</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {description && (
        <div 
          className="relative bg-card/50 rounded-lg shadow-sm overflow-hidden transition-all duration-300"
          style={{ maxHeight: isExpanded ? '1000px' : '100px' }}
        >
          <div className="p-4">
            <p className="text-sm text-card-foreground/90 whitespace-pre-wrap">
              {description}
            </p>
          </div>
          
          {description.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-2 w-full bg-gradient-to-t from-background to-transparent hover:from-muted/80 transition-colors"
            >
              <span className="text-xs font-medium">
                {isExpanded ? "Show less" : "Show more"}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
