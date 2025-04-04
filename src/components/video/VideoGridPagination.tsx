
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
        <button 
          onClick={onShowAll}
          className={`group relative rounded-full text-muted-foreground hover:bg-muted/50 hover:border-gray-300 transition-all duration-300 ${
            isMobile ? "text-[9px] px-2 py-0.5 h-6" : "text-xs px-4 py-1.5"
          }`}
        >
          See More
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            View more videos
          </span>
        </button>
      </div>
    );
  }

  // For pagination display
  return (
    <div className={`flex items-center justify-center gap-6 ${isMobile ? 'mt-4' : 'mt-8'}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`transition-all duration-300 hover:scale-110 p-1 ${
          currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        aria-label="Previous page"
      >
        <div className={`flex justify-center items-center transform rotate-180 ${
          currentPage === 1 ? 'text-gray-300' : 'text-[#ea384c]'
        }`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 6l6 6-6 6" strokeWidth="0" />
          </svg>
        </div>
      </button>
      
      {/* Only show page numbers on mobile */}
      {isMobile && (
        <div className="flex items-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`transition-all duration-300 hover:scale-110 p-1 ${
          currentPage === totalPages ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        aria-label="Next page"
      >
        <div className={`flex justify-center items-center ${
          currentPage === totalPages ? 'text-gray-300' : 'text-[#ea384c]'
        }`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 6l6 6-6 6" strokeWidth="0" />
          </svg>
        </div>
      </button>
    </div>
  );
};
