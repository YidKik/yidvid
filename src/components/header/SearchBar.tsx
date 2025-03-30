
import { Search } from "lucide-react";
import { SearchInput } from "./search/SearchInput";
import { SearchResults } from "./search/SearchResults";
import { useSearch, SearchResults as SearchResultsType } from "./search/useSearch";
import { Button } from "@/components/ui/button";

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
    handleKeyDown,
    setShowResults
  } = useSearch();
  
  const hasResults = 
    ((searchResults?.videos?.length || 0) + 
    (searchResults?.channels?.length || 0)) > 0;

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
      <form onSubmit={handleSearch} className="flex items-center">
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchFocus={onSearchFocus}
          onSearch={handleKeyDown}
          onClose={onClose}
        />
        <Button 
          type="submit" 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>
      
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
