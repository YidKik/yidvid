import { Button } from "@/components/ui/button";
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
  isMobile: boolean;
  onShowAll: () => void;
  onPageChange: (page: number) => void;
}

export const VideoGridPagination = ({
  showAll,
  currentPage,
  totalPages,
  filteredVideosLength,
  maxVideos,
  isMobile,
  onShowAll,
  onPageChange,
}: VideoGridPaginationProps) => {
  return (
    <div className="flex flex-col items-center gap-3 md:gap-4 mt-6 md:mt-8">
      {!showAll && filteredVideosLength > (isMobile ? 8 : maxVideos) && (
        <Button 
          onClick={onShowAll}
          variant="outline"
          className="w-28 h-8 md:w-32 md:h-10 text-sm md:text-base"
        >
          See More
        </Button>
      )}
      
      {showAll && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(currentPage - 1)}
                className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} h-8 md:h-10 text-sm md:text-base`}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(currentPage + 1)}
                className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} h-8 md:h-10 text-sm md:text-base`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};