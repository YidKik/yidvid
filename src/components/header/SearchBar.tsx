
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface SearchBarProps {
  onFocus?: () => void;
  onClose?: () => void;
}

export const SearchBar = ({ onFocus, onClose }: SearchBarProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 200);
  const isMobile = useIsMobile();

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["quick-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return { videos: [], channels: [] };
      
      try {
        // Fetch videos
        const { data: videos, error: videosError } = await supabase
          .from("youtube_videos")
          .select("id, title, thumbnail, channel_name")
          .or(`title.ilike.%${debouncedSearch}%, channel_name.ilike.%${debouncedSearch}%`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5);

        if (videosError) throw videosError;

        // Fetch channels
        const { data: channels, error: channelsError } = await supabase
          .from("youtube_channels")
          .select("channel_id, title, thumbnail_url")
          .or(`title.ilike.%${debouncedSearch}%, description.ilike.%${debouncedSearch}%`)
          .order('created_at', { ascending: false })
          .limit(3);

        if (channelsError) throw channelsError;

        return {
          videos: videos || [],
          channels: channels || []
        };
      } catch (error: any) {
        console.error("Search error:", error);
        if (!error.message?.includes('Failed to fetch')) {
          toast.error("Search is temporarily unavailable");
        }
        return { videos: [], channels: [] };
      }
    },
    enabled: debouncedSearch.length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      onClose?.();
    }
  };

  const hasResults = (searchResults?.videos.length || 0) + (searchResults?.channels.length || 0) > 0;

  return (
    <form onSubmit={handleSearch} className="w-full max-w-lg flex items-center relative group">
      <Input
        type="search"
        placeholder="Search videos and channels..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => {
          setShowResults(true);
          onFocus?.();
        }}
        className="w-full bg-transparent border-primary ring-1 ring-primary/20 text-[#555555] placeholder:text-[#555555] focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 h-7 md:h-10 text-xs md:text-sm pr-10 md:pr-14"
      />
      <Button 
        type="submit"
        variant="ghost" 
        size="icon"
        className="absolute right-1 h-5 w-5 md:h-8 md:w-8 rounded-full bg-gray-100 hover:bg-gray-200"
      >
        <Search className="h-3 w-3 md:h-5 md:w-5 text-[#555555]" />
      </Button>
      {showResults && (hasResults || isSearching) && (
        <div 
          className={`absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50 ${
            isMobile ? 'w-full' : 'w-full max-h-[400px]'
          }`}
          style={{
            top: isMobile ? '35px' : undefined,
            width: isMobile ? '100%' : undefined
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ScrollArea className={`${isMobile ? 'h-[35vh]' : 'h-[400px]'} overflow-y-auto scrollbar-hide`}>
            <div className="p-1">
              {isSearching ? (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : (
                <>
                  {/* Channels Section */}
                  {searchResults?.channels && searchResults.channels.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        Channels
                      </div>
                      {searchResults.channels.map((channel) => (
                        <Link
                          key={channel.channel_id}
                          to={`/channel/${channel.channel_id}`}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors rounded-md"
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery("");
                            onClose?.();
                          }}
                        >
                          <img
                            src={channel.thumbnail_url || '/placeholder.svg'}
                            alt={channel.title}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-[#555555] font-medium line-clamp-1">
                            {channel.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Videos Section */}
                  {searchResults?.videos && searchResults.videos.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        Videos
                      </div>
                      {searchResults.videos.map((video) => (
                        <Link
                          key={video.id}
                          to={`/video/${video.id}`}
                          className="flex items-start gap-2 md:gap-3 p-2 hover:bg-gray-50 transition-colors rounded-md"
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery("");
                            onClose?.();
                          }}
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-12 h-9 md:w-16 md:h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm text-[#555555] font-medium line-clamp-2">
                              {video.title}
                            </p>
                            <p className="text-[10px] md:text-xs text-[#555555]/70 mt-0.5">
                              {video.channel_name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </form>
  );
};
