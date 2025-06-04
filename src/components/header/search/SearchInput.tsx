
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
      <div className="relative flex items-center w-full">
        <Search 
          className="absolute search-icon cursor-pointer z-10" 
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
          className="search-input w-full"
        />
      </div>
    </div>
  );
};
