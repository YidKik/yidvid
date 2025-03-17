import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearch: (e: React.FormEvent) => void;
  onClose?: () => void;
  onClear?: () => void;
}

export const SearchInput = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearch,
  onClose,
  onClear
}: SearchInputProps) => {
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isIconAnimating, setIsIconAnimating] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onSearchFocus();
    setIsIconAnimating(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (isMobile && onClose) {
      onClose();
    } else {
      setIsButtonActive(true);
      setIsIconAnimating(true);
      
      setTimeout(() => {
        setIsButtonActive(false);
      }, 300);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onSearchChange('');
    }
  };

  useEffect(() => {
    if (isIconAnimating) {
      const timer = setTimeout(() => {
        setIsIconAnimating(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isIconAnimating]);

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
          className={`w-full z-10 relative focus-visible:ring-0 focus-visible:ring-offset-0 h-7 md:h-10 text-xs md:text-sm ${isMobile ? 'pr-10 bg-gray-100 text-[#555555]' : 'puzzle-search-input text-[#555555]'}`}
        />
        <div className={`animated-border ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 mr-14 md:mr-16 text-[#ea384c] hover:text-[#d03244] bg-transparent border-none flex items-center justify-center cursor-pointer"
            style={{ outline: 'none' }}
          >
            <X className="h-4 w-4 transition-all duration-150 hover:scale-110" strokeWidth={2.5} />
          </button>
        )}
      </div>
      
      <Button 
        type={isMobile && onClose ? "button" : "submit"}
        onClick={(e) => {
          if (isMobile && onClose) {
            onClose();
          } else {
            handleButtonClick(e);
          }
        }}
        variant="ghost" 
        size="icon"
        className={`z-20 ${isMobile ? 'absolute right-0 h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-100 hover:bg-gray-200' : 'puzzle-search-button'}`}
      >
        <Search 
          className={`
            ${isMobile ? 'h-3 w-3 md:h-5 md:w-5' : 'h-5 w-5'} 
            ${isMobile ? 'text-[#555555]' : 'text-white'}
            ${isIconAnimating && !isMobile ? 'search-icon-pulse' : ''}
          `} 
        />
      </Button>
    </form>
  );
};
