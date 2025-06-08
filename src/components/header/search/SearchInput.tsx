
import { Search, X } from 'lucide-react';
import { useRef } from 'react';

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

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className={`
      relative flex items-center bg-transparent backdrop-blur-sm rounded-full
      border-2 border-red-300 transition-all duration-200
      ${shouldShowDropdown ? 'border-red-500 shadow-lg' : 'hover:border-red-400'}
      ${isMobile ? 'h-9' : 'h-11'}
    `}>
      <Search className={`
        absolute left-3 text-white/70
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
          w-full bg-transparent outline-none text-white placeholder-white/60
          ${isMobile ? 'pl-10 pr-8 text-sm' : 'pl-12 pr-10 text-base'}
          ${isMobile ? 'py-2' : 'py-3'}
        `}
      />
      
      {searchQuery && (
        <button
          onClick={handleClear}
          className={`
            absolute right-3 text-white/60 hover:text-white transition-colors
            ${isMobile ? 'p-1' : 'p-1.5'}
          `}
        >
          <X className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
        </button>
      )}
    </div>
  );
};
