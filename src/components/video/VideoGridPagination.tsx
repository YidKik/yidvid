
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoGridPaginationProps {
  showAll: boolean;
  currentPage: number;
  totalPages: number;
  filteredVideosLength: number;
  maxVideos: number;
  isMobile?: boolean;
  usePaginationArrows?: boolean;
  onShowAll: () => void;
  onPageChange: (page: number) => void;
}

export const VideoGridPagination = ({
  currentPage,
  totalPages,
  isMobile = false,
  onPageChange,
}: VideoGridPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-modern">
      <button 
        className={cn(
          "pagination-button-modern",
          currentPage === 1 && "opacity-40 cursor-not-allowed"
        )}
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className={cn("w-5 h-5", isMobile && "w-4 h-4")} />
      </button>
      
      <span className="text-sm font-medium text-gray-500">
        {currentPage} / {totalPages}
      </span>
      
      <button 
        className={cn(
          "pagination-button-modern",
          currentPage === totalPages && "opacity-40 cursor-not-allowed"
        )}
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className={cn("w-5 h-5", isMobile && "w-4 h-4")} />
      </button>
    </div>
  );
};
