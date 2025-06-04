
import { useRef, useEffect } from 'react';
import { Search, X, Play, Users } from 'lucide-react';
import { useVideoSearch } from '@/hooks/useVideoSearch';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const VideoSearchBar = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setSearchQuery(value);
    if (value.trim().length > 0) {
      setIsSearchOpen(true);
    }
  };

  const handleInputFocus = () => {
    console.log('Search input focused, query:', searchQuery);
    if (searchQuery.trim().length > 0) {
      setIsSearchOpen(true);
    }
  };

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
        <div className={`
          relative flex items-center bg-white/90 backdrop-blur-sm rounded-full
          border-2 border-red-300 transition-all duration-200
          ${shouldShowDropdown ? 'border-red-500 shadow-lg' : 'hover:border-red-400'}
          ${isMobile ? 'h-9' : 'h-11'}
        `}>
          <Search className={`
            absolute left-3 text-red-500/70
            ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}
          `} />
          
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search videos..."
            className={`
              w-full bg-transparent outline-none text-gray-800 placeholder-gray-500
              ${isMobile ? 'pl-10 pr-8 text-sm' : 'pl-12 pr-10 text-base'}
              ${isMobile ? 'py-2' : 'py-3'}
            `}
          />
          
          {searchQuery && (
            <button
              onClick={clearSearch}
              className={`
                absolute right-3 text-gray-400 hover:text-gray-600 transition-colors
                ${isMobile ? 'p-1' : 'p-1.5'}
              `}
            >
              <X className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {shouldShowDropdown && (
          <div className={`
            absolute left-0 right-0 bg-white/95 backdrop-blur-sm
            border-2 border-red-300 border-t-0 rounded-b-2xl shadow-xl z-50
            ${isMobile ? 'top-10' : 'top-12'}
          `}>
            {isLoading && (
              <div className={`
                flex items-center justify-center text-gray-500
                ${isMobile ? 'py-3' : 'py-4'}
              `}>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={isMobile ? 'text-sm' : 'text-base'}>Searching...</span>
                </div>
              </div>
            )}

            {!isLoading && hasResults && (
              <div className="max-h-80 overflow-y-auto">
                {/* Videos Section */}
                {searchResults.videos && searchResults.videos.length > 0 && (
                  <div>
                    <div className={`
                      flex items-center space-x-2 text-gray-600 font-medium border-b border-red-100
                      ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base'}
                    `}>
                      <Play className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
                      <span>Videos ({searchResults.videos.length})</span>
                    </div>
                    {searchResults.videos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => handleVideoClick(video.id)}
                        className={`
                          w-full flex items-center space-x-3 hover:bg-red-50 transition-colors
                          border-b border-red-100 last:border-b-0
                          ${isMobile ? 'p-3' : 'p-4'}
                        `}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className={`
                            object-cover rounded-lg flex-shrink-0
                            ${isMobile ? 'w-16 h-12' : 'w-20 h-14'}
                          `}
                          onError={(e) => {
                            console.error('Failed to load thumbnail:', video.thumbnail);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="flex-1 text-left overflow-hidden">
                          <h4 className={`
                            font-medium text-gray-800 line-clamp-2
                            ${isMobile ? 'text-sm' : 'text-base'}
                          `}>
                            {video.title}
                          </h4>
                          <p className={`
                            text-gray-500 truncate
                            ${isMobile ? 'text-xs' : 'text-sm'}
                          `}>
                            {video.channel_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Channels Section */}
                {searchResults.channels && searchResults.channels.length > 0 && (
                  <div>
                    <div className={`
                      flex items-center space-x-2 text-gray-600 font-medium border-b border-red-100
                      ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base'}
                    `}>
                      <Users className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
                      <span>Channels ({searchResults.channels.length})</span>
                    </div>
                    {searchResults.channels.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => handleChannelClick(channel.channel_id)}
                        className={`
                          w-full flex items-center space-x-3 hover:bg-red-50 transition-colors
                          border-b border-red-100 last:border-b-0
                          ${isMobile ? 'p-3' : 'p-4'}
                        `}
                      >
                        <div className={`
                          rounded-full bg-red-100 flex items-center justify-center flex-shrink-0
                          ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}
                        `}>
                          {channel.thumbnail_url ? (
                            <img
                              src={channel.thumbnail_url}
                              alt={channel.title}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                console.error('Failed to load channel thumbnail:', channel.thumbnail_url);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Users className={`text-red-500 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                          )}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                          <h4 className={`
                            font-medium text-gray-800 truncate
                            ${isMobile ? 'text-sm' : 'text-base'}
                          `}>
                            {channel.title}
                          </h4>
                          <p className={`
                            text-gray-500
                            ${isMobile ? 'text-xs' : 'text-sm'}
                          `}>
                            Channel
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isLoading && searchQuery.trim() && !hasResults && (
              <div className={`
                text-center text-gray-500
                ${isMobile ? 'py-6' : 'py-8'}
              `}>
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className={isMobile ? 'text-sm' : 'text-base'}>No results found</p>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
