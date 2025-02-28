
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearch: (e: React.FormEvent) => void;
  onClose?: () => void;
}

export const SearchInput = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearch,
  onClose
}: SearchInputProps) => {
  const isMobile = useIsMobile();

  return (
    <form onSubmit={onSearch} className="w-full max-w-lg flex items-center relative group">
      <Input
        type="search"
        placeholder="Search videos and channels..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onSearchFocus}
        className="w-full bg-transparent border-primary ring-1 ring-primary/20 text-[#555555] placeholder:text-[#555555] focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0 h-7 md:h-10 text-xs md:text-sm pr-10 md:pr-14"
      />
      {isMobile && onClose ? (
        <Button 
          type="button"
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="absolute right-1 h-5 w-5 md:h-8 md:w-8 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Search className="h-3 w-3 md:h-5 md:w-5 text-[#555555]" />
        </Button>
      ) : (
        <Button 
          type="submit"
          variant="ghost" 
          size="icon"
          className="absolute right-1 h-5 w-5 md:h-8 md:w-8 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Search className="h-3 w-3 md:h-5 md:w-5 text-[#555555]" />
        </Button>
      )}
    </form>
  );
};
