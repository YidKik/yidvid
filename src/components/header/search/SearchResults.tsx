
import { Play, Users, Search } from 'lucide-react';
import { SearchResultItem } from './SearchResultItem';

interface SearchResultsProps {
  searchResults: {
    videos?: Array<{
      id: string;
      video_id?: string;
      title: string;
      thumbnail: string;
      channel_name: string;
    }>;
    channels?: Array<{
      id: string;
      title: string;
      thumbnail_url?: string;
      channel_id: string;
    }>;
  };
  isLoading: boolean;
  hasResults: boolean;
  searchQuery: string;
  onVideoClick: (videoId: string) => void;
  onChannelClick: (channelId: string) => void;
  isMobile: boolean;
}

export const SearchResults = ({
  searchResults,
  isLoading,
  hasResults,
  searchQuery,
  onVideoClick,
  onChannelClick,
  isMobile
}: SearchResultsProps) => {
  
  // Debug logging
  console.log('🎭 SearchResults render:', {
    isLoading,
    hasResults,
    searchQuery,
    videosCount: searchResults?.videos?.length || 0,
    channelsCount: searchResults?.channels?.length || 0,
    searchResults
  });

  return (
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
                <SearchResultItem
                  key={video.id}
                  type="video"
                  item={video}
                  onClick={() => {
                    console.log('🎥 Video clicked:', video);
                    onVideoClick(video.video_id || video.id);
                  }}
                  isMobile={isMobile}
                />
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
                <SearchResultItem
                  key={channel.id}
                  type="channel"
                  item={channel}
                  onClick={() => {
                    console.log('📺 Channel clicked:', channel);
                    onChannelClick(channel.channel_id);
                  }}
                  isMobile={isMobile}
                />
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
          <p className={isMobile ? 'text-sm' : 'text-base'}>No results found for "{searchQuery}"</p>
          <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Try searching with different keywords
          </p>
          <div className="mt-2 text-xs text-gray-400">
            Debug: Videos({searchResults?.videos?.length || 0}), Channels({searchResults?.channels?.length || 0})
          </div>
        </div>
      )}

      {/* Press Enter hint */}
      {searchQuery.trim() && (
        <div className={`
          text-center text-gray-400 border-t border-red-100
          ${isMobile ? 'py-2 px-3 text-xs' : 'py-3 px-4 text-sm'}
        `}>
          Press Enter to see all results
        </div>
      )}
    </div>
  );
};
