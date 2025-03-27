
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
          placeholder={isMobile ? "Search..." : "Search videos and channels..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full bg-transparent z-10 relative border-none text-[#555555] placeholder:text-[#555555] focus-visible:ring-0 focus-visible:ring-offset-0 ${isMobile ? 'h-9 text-sm' : 'h-10 text-sm'} pr-10 md:pr-14`}
        />
        <div className={`animated-border thin-outline ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
      <Button 
        type="submit"
        variant="ghost" 
        size="icon"
        className={`absolute right-1 ${isMobile ? 'h-7 w-7' : 'h-8 w-8'} rounded-full bg-gray-100 hover:bg-gray-200 z-20`}
      >
        <Search className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-[#555555]`} />
      </Button>
    </form>
  );
};
