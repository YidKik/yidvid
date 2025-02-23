
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
      <div className={`flex justify-center ${isMobile ? 'mt-2' : 'mt-8'}`}>
        <Button 
          variant="outline" 
          onClick={onShowAll}
          className={`group relative rounded-full text-muted-foreground hover:bg-muted/50 hover:border-gray-300 transition-all duration-300 ${
            isMobile ? "text-[11px] px-3 py-1" : "text-xs px-4 py-1.5"
          }`}
        >
          See More
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            View more videos
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        size="icon"
        className="group relative rounded-full w-10 h-10 hover:bg-muted/50 hover:border-gray-300 transition-all duration-300"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Previous page
        </span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        size="icon"
        className="group relative rounded-full w-10 h-10 hover:bg-muted/50 hover:border-gray-300 transition-all duration-300"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Next page
        </span>
      </Button>
    </div>
  );
};
