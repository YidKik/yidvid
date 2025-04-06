
import { Button } from "@/components/ui/button";
import { CustomPaginationArrow } from "@/components/ui/custom-pagination-arrow";
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
  // If not showing all, display the "See More" button
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

  // For pagination display with custom arrows
  return (
    <div className={`flex items-center justify-center gap-6 ${isMobile ? 'mt-4' : 'mt-8'}`}>
      <CustomPaginationArrow 
        direction="left"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
      
      {/* Only show page numbers on mobile */}
      {isMobile && (
        <div className="flex items-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      )}
      
      <CustomPaginationArrow 
        direction="right"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  );
};
