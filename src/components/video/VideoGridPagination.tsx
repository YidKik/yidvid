
import { Button } from "@/components/ui/button";
import { CustomPaginationArrow } from "@/components/ui/custom-pagination-arrow";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  showAll,
  currentPage,
  totalPages,
  filteredVideosLength,
  maxVideos,
  isMobile = false,
  usePaginationArrows = false,
  onShowAll,
  onPageChange,
}: VideoGridPaginationProps) => {
  // Always use arrow navigation only (no page numbers)
  if (totalPages > 1) {
    return (
      <div className={`flex items-center justify-center space-x-6 ${isMobile ? 'mt-4' : 'mt-6'}`}>
        <CustomPaginationArrow 
          direction="left" 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
          className={isMobile ? "transform scale-90" : ""}
        />
        
        <CustomPaginationArrow 
          direction="right" 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)}
          className={isMobile ? "transform scale-90" : ""}
        />
      </div>
    );
  }

  return null;
};
