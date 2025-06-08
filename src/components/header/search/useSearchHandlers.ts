
import { useNavigate } from 'react-router-dom';

interface UseSearchHandlersProps {
  setIsSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useSearchHandlers = ({ setIsSearchOpen, setSearchQuery }: UseSearchHandlersProps) => {
  const navigate = useNavigate();

  const handleVideoClick = (videoId: string) => {
    console.log('Video clicked:', videoId);
    navigate(`/video/${videoId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleChannelClick = (channelId: string) => {
    console.log('Channel clicked:', channelId);
    navigate(`/channel/${channelId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleInputChange = (value: string, setIsSearchOpen: (open: boolean) => void) => {
    console.log('Search input changed:', value);
    setSearchQuery(value);
    if (value.trim().length > 0) {
      setIsSearchOpen(true);
    }
  };

  const handleInputFocus = (searchQuery: string, setIsSearchOpen: (open: boolean) => void) => {
    console.log('Search input focused, query:', searchQuery);
    if (searchQuery.trim().length > 0) {
      setIsSearchOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, searchQuery: string) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      console.log('Enter pressed, navigating to search page with query:', searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return {
    handleVideoClick,
    handleChannelClick,
    handleInputChange,
    handleInputFocus,
    handleKeyDown,
    clearSearch
  };
};
