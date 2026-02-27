
import { Search, X } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface SearchInputProps {
  searchQuery: string;
  onQueryChange: (query: string) => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
  shouldShowDropdown: boolean;
  isMobile: boolean;
}

export const SearchInput = ({
  searchQuery,
  onQueryChange,
  onFocus,
  onKeyDown,
  onClear,
  shouldShowDropdown,
  isMobile
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for custom focus event from floating search button
  useEffect(() => {
    const handleFocusSearch = () => {
      inputRef.current?.focus();
      onFocus();
    };

    document.addEventListener('focusSearchBar', handleFocusSearch);
    return () => document.removeEventListener('focusSearchBar', handleFocusSearch);
  }, [onFocus]);

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className={`
      relative flex items-center bg-transparent backdrop-blur-sm rounded-full
      border-2 border-[#E5E5E5] transition-all duration-200
      ${shouldShowDropdown ? 'border-[#FFCC00] shadow-lg' : 'hover:border-[#FFCC00]'}
      ${isMobile ? 'h-9' : 'h-11'}
    `}>
      <Search className={`
        absolute left-3 text-[#999999]
        ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}
      `} />
      
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder="Search videos..."
        className={`
          w-full bg-transparent outline-none text-[#1A1A1A] placeholder-[#999999]
          ${isMobile ? 'pl-10 pr-8 text-base' : 'pl-12 pr-10 text-base'}
          ${isMobile ? 'py-2' : 'py-3'}
        `}
        style={{ fontSize: '16px' }}
      />
      
      {searchQuery && (
        <button
          onClick={handleClear}
          className={`
            absolute right-3 text-[#999999] hover:text-[#1A1A1A] transition-colors
            ${isMobile ? 'p-1' : 'p-1.5'}
          `}
        >
          <X className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
        </button>
      )}
    </div>
  );
};
