
import { useRef, useEffect } from 'react';
import { useVideoSearch } from '@/hooks/useVideoSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { SearchInput } from './search/SearchInput';
import { SearchResults } from './search/SearchResults';
import { useSearchHandlers } from './search/useSearchHandlers';

export const VideoSearchBar = () => {
  const { isMobile } = useIsMobile();
  const searchRef = useRef<HTMLDivElement>(null);
  
  const {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    searchResults,
    isLoading,
    hasResults,
    debouncedQuery
  } = useVideoSearch();

  const {
    handleVideoClick,
    handleChannelClick,
    handleInputChange,
    handleInputFocus,
    handleKeyDown,
    clearSearch
  } = useSearchHandlers({ setIsSearchOpen, setSearchQuery });

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchOpen]);

  // Show dropdown when we have a query or are loading
  const shouldShowDropdown = isSearchOpen && (searchQuery.trim().length > 0 || isLoading);

  console.log('VideoSearchBar state:', {
    searchQuery,
    debouncedQuery,
    isSearchOpen,
    shouldShowDropdown,
    isLoading,
    hasResults,
    resultsCount: searchResults ? (searchResults.videos?.length || 0) + (searchResults.channels?.length || 0) : 0
  });

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <SearchInput
          searchQuery={searchQuery}
          onQueryChange={(value) => handleInputChange(value, setIsSearchOpen)}
          onFocus={() => handleInputFocus(searchQuery, setIsSearchOpen)}
          onKeyDown={(e) => handleKeyDown(e, searchQuery)}
          onClear={clearSearch}
          shouldShowDropdown={shouldShowDropdown}
          isMobile={isMobile}
        />

        {/* Search Results Dropdown */}
        {shouldShowDropdown && (
          <SearchResults
            searchResults={searchResults}
            isLoading={isLoading}
            hasResults={hasResults}
            searchQuery={searchQuery}
            onVideoClick={handleVideoClick}
            onChannelClick={handleChannelClick}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};
