
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

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
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onSearchFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <form onSubmit={onSearch} className="w-full max-w-lg flex items-center relative group">
      <div className="search-animated-border w-full relative">
        <Input
          type="search"
          placeholder="Search videos and channels..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full bg-transparent z-10 relative border-none text-[#555555] placeholder:text-[#555555] focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0 h-7 md:h-10 text-xs md:text-sm pr-10 md:pr-14"
        />
        <div className={`animated-border ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
      {isMobile && onClose ? (
        <Button 
          type="button"
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="absolute right-1 h-5 w-5 md:h-8 md:w-8 rounded-full bg-gray-100 hover:bg-gray-200 z-20"
        >
          <Search className="h-3 w-3 md:h-5 md:w-5 text-[#555555]" />
        </Button>
      ) : (
        <Button 
          type="submit"
          variant="ghost" 
          size="icon"
          className="absolute right-1 h-5 w-5 md:h-8 md:w-8 rounded-full bg-gray-100 hover:bg-gray-200 z-20"
        >
          <Search className="h-3 w-3 md:h-5 md:w-5 text-[#555555]" />
        </Button>
      )}
    </form>
  );
};
