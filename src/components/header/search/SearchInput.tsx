
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { KeyboardEvent, useState, useRef, useCallback, memo } from "react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearch: (e: KeyboardEvent<HTMLInputElement>) => void;
  onClickSearch: () => void;
  onClose?: () => void;
}

export const SearchInput = memo(({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearch,
  onClickSearch,
  onClose,
}: SearchInputProps) => {
  const { isMobile } = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when the search icon is clicked
  const handleSearchIconClick = useCallback(() => {
    inputRef.current?.focus();
    onClickSearch();
  }, [onClickSearch]);
  
  // Optimize the change handler to reduce rerenders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);
  
  // Optimize focus handling
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onSearchFocus();
  }, [onSearchFocus]);
  
  return (
    <div className="relative w-full search-animated-border">
      <div className={`relative flex items-center ${isMobile ? 'w-full' : 'w-full'}`}>
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 search-icon cursor-pointer" 
          onClick={handleSearchIconClick}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search videos, channels..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          onKeyDown={onSearch}
          className={`
            search-input py-2 pl-10 pr-4 rounded-lg border-gray-200
            ${isMobile ? 'h-8 text-sm w-full' : 'h-9 w-full'}
            focus:ring-0 focus:outline-none focus:border-transparent
            transition-all duration-300
          `}
          aria-label="Search"
          data-testid="search-input"
        />
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
