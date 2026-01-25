
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
}

export const VideoSectionHeader = ({
  title,
  seeAllLink,
  onPrevious,
  onNext,
  canScrollPrev = true,
  canScrollNext = true,
  showNavigation = true,
}: VideoSectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
        {title}
      </h2>
      
      <div className="flex items-center gap-2">
        {seeAllLink && (
          <Link 
            to={seeAllLink}
            className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors mr-2"
          >
            See all
          </Link>
        )}
        
        {showNavigation && (
          <div className="flex gap-1">
            <button
              onClick={onPrevious}
              disabled={!canScrollPrev}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                canScrollPrev 
                  ? 'hover:bg-muted text-foreground hover:scale-105' 
                  : 'text-muted-foreground/40 cursor-not-allowed'
              }`}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              disabled={!canScrollNext}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                canScrollNext 
                  ? 'hover:bg-muted text-foreground hover:scale-105' 
                  : 'text-muted-foreground/40 cursor-not-allowed'
              }`}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
