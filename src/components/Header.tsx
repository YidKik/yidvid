import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, LayoutDashboard, Search, Bell } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Auth from "@/pages/Auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  videos: {
    id: string;
    title: string;
    channel_name: string;
    channel_id: string;
  }[];
  channels: {
    channel_id: string;
    title: string;
  }[];
}

export const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult>({ 
    videos: [], 
    channels: [] 
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  
  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await refetchSession();
        // This will trigger a refetch of profile and notifications since they depend on session
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetchSession]);

  // Load hidden channels
  useEffect(() => {
    const loadHiddenChannels = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: hiddenChannelsData, error } = await supabase
        .from('hidden_channels')
        .select('channel_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error loading hidden channels:', error);
        return;
      }

      setHiddenChannels(new Set(hiddenChannelsData.map(hc => hc.channel_id)));
    };

    loadHiddenChannels();
  }, []);

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

  const { data: notifications } = useQuery({
    queryKey: ["notifications", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      // Get notifications for new videos (last 24 hours) from subscribed channels
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getTime() - 24);

      const { data } = await supabase
        .from("video_notifications")
        .select(`
          *,
          youtube_videos (
            id,
            title,
            channel_name,
            thumbnail,
            uploaded_at
          )
        `)
        .eq("user_id", session?.user?.id)
        .eq("is_read", false)
        .gte("youtube_videos.uploaded_at", twentyFourHoursAgo.toISOString())
        .order("created_at", { ascending: false });
      
      return data?.filter(notification => 
        notification.youtube_videos?.uploaded_at >= twentyFourHoursAgo.toISOString()
      );
    },
  });

  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("video_notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  useEffect(() => {
    const searchContent = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ videos: [], channels: [] });
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const [videosResponse, channelsResponse] = await Promise.all([
          supabase
            .from("youtube_videos")
            .select("id, title, channel_name, channel_id")
            .ilike('title', `%${searchQuery}%`)
            .limit(5),
          supabase
            .from("youtube_channels")
            .select("channel_id, title")
            .ilike('title', `%${searchQuery}%`)
            .limit(3)
        ]);

        if (videosResponse.error) {
          console.error("Videos search error:", videosResponse.error);
          throw new Error(videosResponse.error.message);
        }

        if (channelsResponse.error) {
          console.error("Channels search error:", channelsResponse.error);
          throw new Error(channelsResponse.error.message);
        }

        // Filter out videos from hidden channels
        const filteredVideos = (videosResponse.data || []).filter(
          video => !hiddenChannels.has(video.channel_id)
        );

        // Filter out hidden channels
        const filteredChannels = (channelsResponse.data || []).filter(
          channel => !hiddenChannels.has(channel.channel_id)
        );

        setSearchResults({
          videos: filteredVideos,
          channels: filteredChannels,
        });
      } catch (error: any) {
        console.error("Search error:", error);
        setSearchError("Unable to perform search. Please try again.");
        toast.error("Search failed. Please try again later.");
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, hiddenChannels]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      await refetchSession();
      navigate("/");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const hasResults = searchResults.videos.length > 0 || searchResults.channels.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl bg-gradient-to-r from-red-50/30 via-background/80 to-red-50/30 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex-shrink-0 w-32">
          <span className="text-xl font-bold text-primary">
            Jewish Tube
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos and channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="w-full pl-8 h-9 bg-transparent border focus:ring-0 text-sm placeholder:text-muted-foreground rounded-full max-w-full"
            />
          </div>
          {showResults && searchQuery && (isSearching || searchResults.videos.length > 0 || searchResults.channels.length > 0 || searchError) && (
            <div className="absolute w-full max-w-xl mt-1 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50">
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
                  {!searchResults.videos.length && !searchResults.channels.length && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No results found
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </form>

        <nav className="flex items-center gap-2 w-32 justify-end">
          {session ? (
            <div className="flex items-center gap-3">
              {profile?.is_admin && (
                <Link to="/dashboard">
                  <LayoutDashboard 
                    className="text-primary hover:text-primary/80 transition-all duration-300 hover:scale-110 hover:-rotate-12 cursor-pointer" 
                  />
                </Link>
              )}
              <span className="text-sm font-medium">
                {session.user.user_metadata.full_name || profile?.name || "User"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="relative inline-flex items-center justify-center bg-white p-1.5 rounded-full">
                    <Bell 
                      size={18}
                      className={`text-primary hover:text-primary/80 transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer ${
                        notifications && notifications.length > 0 ? 'animate-[gentle-fade_1s_ease-in-out_infinite_alternate]' : ''
                      }`}
                    />
                    {notifications && notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-zinc-950 border-zinc-800">
                  <ScrollArea className="h-[300px] w-full rounded-md">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((notification: any) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex flex-col items-start p-3 cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 border-b border-zinc-800 last:border-0"
                          onClick={() => {
                            markNotificationAsRead(notification.id);
                            window.location.href = `/video/${notification.youtube_videos.id}`;
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <img
                              src={notification.youtube_videos.thumbnail}
                              alt={notification.youtube_videos.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-1 text-zinc-100">
                                {notification.youtube_videos.title}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {notification.youtube_videos.channel_name}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-center text-zinc-400">
                        No new notifications
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to="/settings">
                <Settings 
                  className="text-primary hover:text-primary/80 transition-all duration-300 hover:scale-110 hover:-rotate-12 cursor-pointer" 
                />
              </Link>
              <LogOut 
                className="text-primary hover:text-primary/80 transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer" 
                onClick={handleSignOut}
              />
            </div>
          ) : (
            <>
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary text-primary-foreground hover:text-black transition-colors"
                onClick={() => setIsAuthOpen(true)}
              >
                Sign In
              </Button>
              <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
            </>
          )}
        </nav>
      </div>
    </header>
  );
};