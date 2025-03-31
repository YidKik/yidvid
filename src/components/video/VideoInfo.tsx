
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

  // Format the date with robust error handling
  const getFormattedDate = () => {
    try {
      if (!uploadedAt) return "recently";
      
      const dateToFormat = new Date(uploadedAt);
      
      // Check if date is valid
      if (isNaN(dateToFormat.getTime())) {
        console.warn("Invalid date in VideoInfo:", uploadedAt);
        return "recently";
      }
      
      return formatDistanceToNow(dateToFormat, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date in VideoInfo:", error);
      return "recently";
    }
  };

  const formattedDate = getFormattedDate();
  const formattedViews = views?.toLocaleString() || "0";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-background shadow-lg">
            <AvatarImage src={channelThumbnail || ''} alt={channelName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <img src="/lovable-uploads/efca5adc-d9d2-4c5b-8900-e078f9d49b6a.png" alt="YidVid Logo" className="h-8 w-8" />
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
            <div className="absolute bottom-0 left-0 right-0 pt-6 pb-2 bg-gradient-to-t from-background via-background/95 to-transparent">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mx-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 shadow-sm transition-all duration-200 group"
              >
                <span className="text-sm font-medium text-gray-700">
                  {isExpanded ? "Show less" : "Show more"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
