
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoGridPaginationProps {
  showAll: boolean;
  currentPage: number;
  totalPages: number;
  filteredVideosLength: number;
  maxVideos: number;
  isMobile?: boolean;
  onShowAll: () => void;
  onPageChange: (page: number) => void;
}

export const VideoGridPagination = ({
  showAll,
  currentPage,
  totalPages,
  filteredVideosLength,
  maxVideos,
  isMobile = false,
  onShowAll,
  onPageChange,
}: VideoGridPaginationProps) => {
  if (!showAll) {
    return (
      <div className={`flex justify-center ${isMobile ? 'mt-1' : 'mt-8'}`}>
        <Button 
          variant="outline" 
          onClick={onShowAll}
          className={`group relative rounded-full text-muted-foreground hover:bg-muted/50 hover:border-gray-300 transition-all duration-300 ${
            isMobile ? "text-[9px] px-2 py-0.5 h-6" : "text-xs px-4 py-1.5"
          }`}
        >
          See More
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            View more videos
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center gap-4 ${isMobile ? 'mt-4' : 'mt-8'}`}>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        size="icon"
        className={`group relative rounded-full hover:bg-muted/50 hover:border-gray-300 transition-all duration-300 ${
          isMobile ? "w-7 h-7" : "w-10 h-10"
        }`}
      >
        <ChevronLeft className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
        <span className={`absolute left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          isMobile ? "-bottom-4 text-[8px]" : "-bottom-6"
        }`}>
          Previous page
        </span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        size="icon"
        className={`group relative rounded-full hover:bg-muted/50 hover:border-gray-300 transition-all duration-300 ${
          isMobile ? "w-7 h-7" : "w-10 h-10"
        }`}
      >
        <ChevronRight className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
        <span className={`absolute left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          isMobile ? "-bottom-4 text-[8px]" : "-bottom-6"
        }`}>
          Next page
        </span>
      </Button>
    </div>
  );
};
