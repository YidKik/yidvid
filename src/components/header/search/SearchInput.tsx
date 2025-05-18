
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { KeyboardEvent, useState } from "react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearch: (e: KeyboardEvent<HTMLInputElement>) => void;
  onClickSearch: () => void;
  onClose?: () => void;
}

export const SearchInput = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearch,
  onClickSearch,
  onClose,
}: SearchInputProps) => {
  const { isMobile } = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative w-full search-animated-border">
      <div className={`relative flex items-center ${isMobile ? 'w-full' : 'w-full'}`}>
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 search-icon cursor-pointer" 
          onClick={onClickSearch}
        />
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onSearchFocus();
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={onSearch}
          className={`
            search-input py-2 pl-10 pr-4 rounded-full border-gray-200
            ${isMobile ? 'h-8 text-sm w-full' : 'h-10 w-full'}
            transition-all duration-100
          `}
        />
      </div>
    </div>
  );
};
