
import { SearchInput } from "./search/SearchInput";
import { SearchResults } from "./search/SearchResults";
import { useSearch, SearchResults as SearchResultsType } from "./search/useSearch";
import { memo, useEffect } from "react";
import { Helmet } from "react-helmet";

interface SearchBarProps {
  onFocus?: () => void;
  onClose?: () => void;
}

export const SearchBar = memo(({ onFocus, onClose }: SearchBarProps) => {
  const {
    searchQuery,
    showResults,
    searchResults,
    isSearching,
    handleSearch,
    handleSearchChange,
    handleSearchFocus,
    handleResultClick,
    handleKeyDown,
    setShowResults
  } = useSearch();

  // Handle the callback to parent component if needed
  const onSearchFocus = () => {
    handleSearchFocus();
    onFocus?.();
  };

  // Handle cleanup when closing
  const handleClose = () => {
    setShowResults(false);
    onClose?.();
  };

  // Generate dynamic SEO keywords based on search results
  const generateSeoKeywords = () => {
    if (!searchResults) return "";
    
    const videoTitles = searchResults.videos?.map(video => video.title) || [];
    const channelNames = searchResults.channels?.map(channel => channel.title) || [];
    
    return [...videoTitles, ...channelNames, "Jewish videos", "Yiddish videos", "kosher content", "Jewish content"].join(", ");
  };

  return (
    <div className="relative w-full">
      {searchQuery && (
        <Helmet>
          <meta name="keywords" content={generateSeoKeywords()} />
          <meta name="description" content={`Search results for ${searchQuery} - Find Jewish videos, channels, and content on YidVid`} />
        </Helmet>
      )}
      
      <form onSubmit={handleSearch} className="flex items-center">
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchFocus={onSearchFocus}
          onSearch={handleKeyDown}
          onClickSearch={() => handleSearch(new Event('submit') as any)}
          onClose={onClose}
        />
      </form>
      
      <SearchResults
        isSearching={isSearching}
        videos={searchResults?.videos || []}
        channels={searchResults?.channels || []}
        onResultClick={() => {
          handleResultClick();
          onClose?.();
        }}
        showResults={showResults}
      />
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
