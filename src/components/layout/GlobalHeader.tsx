import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useIsMobile } from "@/hooks/use-mobile";
import Auth from "@/pages/Auth";
import { useVideoSearch } from "@/hooks/useVideoSearch";
import { NotificationsMenu } from "@/components/header/NotificationsMenu";

export const GlobalHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { isAuthenticated, session, profile } = useSessionManager();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const isHomePage = location.pathname === "/";

  const {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    searchResults,
    isLoading: isSearching,
    hasResults
  } = useVideoSearch();

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleChannelClick = (channelId: string) => {
    navigate(`/channel/${channelId}`);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const getUserInitial = () => {
    if (profile?.display_name) return profile.display_name.charAt(0).toUpperCase();
    if (profile?.name) return profile.name.charAt(0).toUpperCase();
    if (session?.user?.email) return session.user.email.charAt(0).toUpperCase();
    return "U";
  };

  const handleMarkNotificationsAsRead = async () => {};

  const shouldShowDropdown = isSearchOpen && searchQuery.trim().length > 0;

  // Homepage: floating profile icon only
  if (isHomePage) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          {isAuthenticated ? (
            <Link
              to="/settings"
              className="flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold text-sm transition-transform hover:scale-105 shadow-lg bg-[#FF0000]"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              title="Profile"
            >
              {getUserInitial()}
            </Link>
          ) : (
            <Button
              onClick={() => setIsAuthOpen(true)}
              size="icon"
              className="rounded-full w-10 h-10 shadow-lg hover:opacity-90 transition-all bg-[#FF0000] text-white"
              title="Sign In"
            >
              <LogIn className="w-5 h-5" />
            </Button>
          )}
        </div>
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </>
    );
  }

  return (
    <>
      <header
        className="fixed top-0 z-40 bg-white border-b border-[#E5E5E5]"
        style={{ left: 200, right: 0 }}
      >
        <div className="w-full px-3 md:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Left Side - Spacer */}
            <div className="w-10 shrink-0 flex items-center" />

            {/* Center - Search Bar */}
            <div 
              ref={searchContainerRef}
              className="flex-1 max-w-xl relative"
            >
              <form onSubmit={handleSearchSubmit}>
                <div 
                  className={`flex items-center rounded-full border-2 transition-all duration-200 bg-[#F5F5F5] ${
                    isSearchOpen 
                      ? 'border-[#FFCC00] shadow-md bg-white' 
                      : 'border-[#E5E5E5] hover:border-[#FFCC00] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center flex-1 pl-4 pr-2">
                    <Search className="w-4 h-4 text-[#999999] shrink-0 mr-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      placeholder="Search videos..."
                      className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#999999]"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchOpen(false);
                        }}
                        className="p-1 rounded-full hover:bg-[#E5E5E5] transition-colors"
                      >
                        <X className="w-4 h-4 text-[#666666]" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-r-full border-l border-[#E5E5E5] hover:bg-[#E5E5E5] transition-colors flex items-center justify-center bg-white"
                  >
                    <Search className="w-4 h-4 text-[#666666]" />
                  </button>
                </div>
              </form>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {shouldShowDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[100]"
                    style={{ maxHeight: '70vh' }}
                  >
                    {isSearching && (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-gray-500">Searching...</span>
                      </div>
                    )}

                    {!isSearching && hasResults && (
                      <div className="max-h-80 overflow-y-auto">
                        {/* Videos */}
                        {searchResults.videos && searchResults.videos.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                              Videos
                            </div>
                            {searchResults.videos.slice(0, 5).map((video: any) => (
                              <button
                                key={video.id}
                                onClick={() => handleVideoClick(video.video_id || video.id)}
                                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                              >
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-16 h-10 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {video.title}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {video.channel_name}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Channels */}
                        {searchResults.channels && searchResults.channels.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-t">
                              Channels
                            </div>
                            {searchResults.channels.slice(0, 3).map((channel: any) => (
                              <button
                                key={channel.id}
                                onClick={() => handleChannelClick(channel.channel_id)}
                                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                              >
                                <img
                                  src={channel.thumbnail_url || '/placeholder.svg'}
                                  alt={channel.title}
                                  className="w-10 h-10 object-cover rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {channel.title}
                                  </p>
                                  <p className="text-xs text-gray-500">Channel</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!isSearching && searchQuery.trim() && !hasResults && (
                      <div className="py-6 text-center">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">No results found</p>
                      </div>
                    )}

                    {/* Press Enter hint */}
                    {searchQuery.trim() && (
                      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-center border-t">
                        Press Enter to see all results
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side - Notifications + Sign In / Profile */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Notification Bell */}
              {isAuthenticated && (
                <NotificationsMenu onMarkAsRead={handleMarkNotificationsAsRead} />
              )}

              {/* Profile / Sign In */}
              {isAuthenticated ? (
                <Link
                  to="/settings"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white font-semibold text-sm transition-transform hover:scale-105"
                  style={{ 
                    backgroundColor: 'hsl(0, 70%, 55%)',
                    fontFamily: "'Quicksand', sans-serif"
                  }}
                  title="Profile"
                >
                  {getUserInitial()}
                </Link>
              ) : (
                <Button
                  onClick={() => setIsAuthOpen(true)}
                  size={isMobile ? "sm" : "default"}
                  className="rounded-full gap-2 font-medium hover:opacity-90 transition-all"
                  style={{ 
                    fontFamily: "'Quicksand', sans-serif",
                    backgroundColor: 'hsl(0, 70%, 55%)',
                    color: 'white'
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  {!isMobile && <span>Sign In</span>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};
