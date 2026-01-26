
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface VideoSectionHeaderProps {
  title: string;
  seeAllLink?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  canScrollPrev?: boolean;
  canScrollNext?: boolean;
  showNavigation?: boolean;
  variant?: "default" | "accent";
}

export const VideoSectionHeader = ({
  title,
  seeAllLink,
  onPrevious,
  onNext,
  canScrollPrev = true,
  canScrollNext = true,
  showNavigation = true,
  variant = "default",
}: VideoSectionHeaderProps) => {
  const isAccent = variant === "accent";
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {isAccent && (
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-red-500" />
        )}
        <h2 
          className={`text-lg md:text-xl font-bold ${isAccent ? 'text-primary' : 'text-foreground'}`} 
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          {title}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        {seeAllLink && (
          <Link 
            to={seeAllLink}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-primary/5"
          >
            View all
          </Link>
        )}
        
        {showNavigation && (
          <div className="flex gap-1.5">
            <button
              onClick={onPrevious}
              disabled={!canScrollPrev}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollPrev 
                  ? 'bg-muted hover:bg-muted/80 text-foreground' 
                  : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
              }`}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              disabled={!canScrollNext}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollNext 
                  ? 'bg-muted hover:bg-muted/80 text-foreground' 
                  : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
              }`}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
