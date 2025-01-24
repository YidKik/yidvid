import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, LayoutDashboard, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface SearchResult {
  videos: {
    id: string;
    title: string;
    channel_name: string;
  }[];
  channels: {
    channel_id: string;
    title: string;
  }[];
}

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult>({ 
    videos: [], 
    channels: [] 
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .maybeSingle();
      
      return data;
    },
  });

  useEffect(() => {
    const searchContent = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ videos: [], channels: [] });
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      const retryCount = 3;
      let attempt = 0;
      const baseDelay = 1000; // 1 second

      while (attempt < retryCount) {
        try {
          const searchTerm = `%${searchQuery}%`;
          
          // Add timeout to the fetch requests
          const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 5000);
          });

          const [videosResponse, channelsResponse] = await Promise.race([
            Promise.all([
              supabase
                .from("youtube_videos")
                .select("id, title, channel_name")
                .ilike("title", searchTerm)
                .limit(5),
              supabase
                .from("youtube_channels")
                .select("channel_id, title")
                .ilike("title", searchTerm)
                .limit(3),
            ]),
            timeout
          ]);

          // Type guard to ensure we have the responses and not the timeout
          if (Array.isArray(videosResponse) && Array.isArray(channelsResponse)) {
            if (videosResponse.error) {
              console.error("Video search error:", videosResponse.error);
              throw new Error(videosResponse.error.message);
            }

            if (channelsResponse.error) {
              console.error("Channel search error:", channelsResponse.error);
              throw new Error(channelsResponse.error.message);
            }

            setSearchResults({
              videos: videosResponse.data || [],
              channels: channelsResponse.data || [],
            });
            break; // Success, exit retry loop
          }
        } catch (error: any) {
          console.error(`Search attempt ${attempt + 1} failed:`, error);
          attempt++;
          
          if (attempt === retryCount) {
            setSearchError("Search is temporarily unavailable. Please try again later.");
            toast.error("Unable to perform search. Please try again later.");
          } else {
            // Exponential backoff
            const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      setIsSearching(false);
    };

    const debounceTimeout = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const hasResults = searchResults.videos.length > 0 || searchResults.channels.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl bg-gradient-to-r from-red-50/30 via-background/80 to-red-50/30 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4 px-4">
        {/* Logo Section */}
        <Link to="/" className="flex-shrink-0">
          <span className="text-xl font-bold text-primary">
            Jewish Tube
          </span>
        </Link>

        {/* Search Section - Centered */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos and channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="w-full pl-8 h-9 bg-transparent border focus:ring-0 text-sm placeholder:text-muted-foreground rounded-full"
            />
          </div>
          {showResults && searchQuery && (isSearching || hasResults || searchError) && (
            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Searching...
                  </div>
                ) : searchError ? (
                  <div className="px-4 py-2 text-sm text-red-500">
                    {searchError}
                  </div>
                ) : (
                  <>
                    {searchResults.channels.length > 0 && (
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                        Channels
                      </div>
                    )}
                    {searchResults.channels.map((channel) => (
                      <Link
                        key={channel.channel_id}
                        to={`/channel/${channel.channel_id}`}
                        className="block px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <span className="text-primary">{channel.title}</span>
                      </Link>
                    ))}
                    {searchResults.videos.length > 0 && (
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                        Videos
                      </div>
                    )}
                    {searchResults.videos.map((video) => (
                      <Link
                        key={video.id}
                        to={`/video/${video.id}`}
                        className="block px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <span className="text-primary">{video.title}</span>
                        <p className="text-sm text-gray-500">{video.channel_name}</p>
                      </Link>
                    ))}
                    {!hasResults && (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No results found
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Navigation Section */}
        <nav className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-3">
              {profile?.is_admin && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-transparent p-0"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="text-primary hover:scale-110 transition-transform" />
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hover:bg-transparent p-0"
              >
                <Link to="/settings">
                  <Settings className="text-primary hover:scale-110 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hover:bg-transparent p-0"
              >
                <LogOut className="text-primary hover:scale-110 transition-transform" />
              </Button>
              <Avatar>
                <AvatarImage src={session.user.user_metadata.avatar_url} />
                <AvatarFallback>
                  {session.user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Button variant="default" asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};