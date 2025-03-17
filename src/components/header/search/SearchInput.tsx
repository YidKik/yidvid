
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
      <div className={`w-full relative ${isMobile ? '' : 'puzzle-search-container'}`}>
        <Input
          type="search"
          placeholder="Search videos and channels..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full bg-transparent z-10 relative text-[#555555] placeholder:text-[#555555] focus-visible:ring-0 focus-visible:ring-offset-0 h-7 md:h-10 text-xs md:text-sm ${isMobile ? 'pr-10' : 'puzzle-search-input'}`}
        />
        <div className={`animated-border ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
      
      <Button 
        type={isMobile && onClose ? "button" : "submit"}
        onClick={isMobile && onClose ? onClose : undefined}
        variant="ghost" 
        size="icon"
        className={`z-20 ${isMobile ? 'absolute right-0 h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-100 hover:bg-gray-200' : 'puzzle-search-button'}`}
      >
        <Search className={`${isMobile ? 'h-3 w-3 md:h-5 md:w-5' : 'h-5 w-5'} ${isMobile ? 'text-[#555555]' : 'text-white'}`} />
      </Button>
    </form>
  );
};
