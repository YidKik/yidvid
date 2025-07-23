import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface VideoDescriptionProps {
  description?: string;
}

export const VideoDescription = ({ description }: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return null;
  }

  return (
    <div className="bg-card/30 rounded-xl p-6 border border-border/50 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Description</h3>
      
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
            isExpanded ? '' : 'line-clamp-4'
          }`}>
            {description}
          </p>
        </div>
        
        {description.length > 300 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-2 hover:bg-accent rounded-lg transition-colors duration-200 group"
            aria-label={isExpanded ? "Show less" : "Show more"}
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        )}
      </div>
      
      {description.length > 300 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};