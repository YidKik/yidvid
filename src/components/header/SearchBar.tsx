
import { SearchInput } from "./search/SearchInput";
import { SearchResults } from "./search/SearchResults";
import { useSearch } from "./search/useSearch";

interface SearchBarProps {
  onFocus?: () => void;
  onClose?: () => void;
}

export const SearchBar = ({ onFocus, onClose }: SearchBarProps) => {
  const {
    searchQuery,
    showResults,
    searchResults,
    isSearching,
    handleSearch,
    handleSearchChange,
    handleSearchFocus,
    handleResultClick,
    setShowResults
  } = useSearch();
  
  const hasResults = 
    (searchResults?.videos?.length || 0) + 
    (searchResults?.channels?.length || 0) > 0;

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

  return (
    <div className="relative w-full">
      <SearchInput
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchFocus={onSearchFocus}
        onSearch={(e) => {
          handleSearch(e);
          onClose?.();
        }}
        onClose={onClose}
      />
      
      <SearchResults
        isSearching={isSearching}
        videos={searchResults?.videos || []}
        channels={searchResults?.channels || []}
        onResultClick={() => {
          handleResultClick();
          onClose?.();
        }}
        showResults={showResults && (hasResults || isSearching)}
      />
    </div>
  );
};
