
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
  // Use pagination arrows for both mobile and desktop when usePaginationArrows is true
  if (usePaginationArrows && totalPages > 1) {
    return (
      <div className={`flex items-center justify-center space-x-4 ${isMobile ? 'mt-2' : 'mt-6'}`}>
        <CustomPaginationArrow 
          direction="left" 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
          className={isMobile ? "transform scale-75" : ""}
        />
        
        <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {currentPage} / {totalPages}
        </span>
        
        <CustomPaginationArrow 
          direction="right" 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)}
          className={isMobile ? "transform scale-75" : ""}
        />
      </div>
    );
  }

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
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
        
        <PaginationItem className="flex items-center">
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
        </PaginationItem>
        
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
