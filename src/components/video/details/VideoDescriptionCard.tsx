import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoDescriptionCardProps {
  description?: string;
}

export const VideoDescriptionCard = ({ description }: VideoDescriptionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return null;
  }

  const shouldShowExpand = description.length > 250;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
      
      <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${
        !isExpanded && shouldShowExpand ? 'line-clamp-4' : ''
      }`}>
        {description}
      </p>
      
      {shouldShowExpand && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-primary hover:text-primary/80 hover:bg-primary/5 px-0"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show more
            </>
          )}
        </Button>
      )}
    </div>
  );
};
