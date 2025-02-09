
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

export const SearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 200);
  const isMobile = useIsMobile();

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["quick-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return [];
      
      try {
        const { data: videos, error } = await supabase
          .from("youtube_videos")
          .select("id, title, thumbnail, channel_name")
          .or(`title.ilike.%${debouncedSearch}%, channel_name.ilike.%${debouncedSearch}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return videos || [];
      } catch (error: any) {
        console.error("Search error:", error);
        if (!error.message?.includes('Failed to fetch')) {
          toast.error("Search is temporarily unavailable");
        }
        return [];
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
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-lg flex items-center relative group">
      <Input
        type="search"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        className="w-full bg-transparent border-primary ring-1 ring-primary/20 text-[#555555] placeholder:text-[#555555] focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 h-8 md:h-10 text-xs md:text-sm"
      />
      <Button 
        type="submit"
        variant="ghost" 
        size="icon"
        className="absolute right-2 h-5 w-5 md:h-7 md:w-7 rounded-full bg-gray-100 hover:bg-gray-200"
      >
        <Search className="h-3 w-3 md:h-4 md:w-4 text-[#555555]" />
      </Button>
      {showResults && (searchResults?.length > 0 || isSearching) && (
        <div 
          className={`absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50 ${
            isMobile ? 'fixed left-4 right-4 max-h-[60vh]' : 'w-full max-h-[400px]'
          }`}
          style={{
            top: isMobile ? '60px' : undefined
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ScrollArea className={`${isMobile ? 'h-[50vh]' : 'h-[400px]'} overflow-y-auto scrollbar-hide`}>
            <div className="p-1">
              {isSearching ? (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : (
                searchResults?.map((video) => (
                  <Link
                    key={video.id}
                    to={`/video/${video.id}`}
                    className="flex items-start gap-2 md:gap-3 p-2 md:p-3 hover:bg-gray-50 transition-colors rounded-md"
                    onClick={() => {
                      setShowResults(false);
                      setSearchQuery("");
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
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </form>
  );
};
