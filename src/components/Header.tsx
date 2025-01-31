import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, LayoutDashboard, Bell, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [session, setSession] = useState(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set up initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch notifications for the current user
  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["video-notifications", session?.user?.id],
    queryFn: async () => {
      const { data: notifications, error } = await supabase
        .from("video_notifications")
        .select(`
          *,
          youtube_videos (
            title,
            thumbnail,
            channel_name
          )
        `)
        .eq("user_id", session?.user?.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to fetch notifications");
        return [];
      }

      return notifications || [];
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark notifications as read
  const markNotificationsAsRead = async () => {
    if (!session?.user?.id || !notifications?.length) return;

    const { error } = await supabase
      .from("video_notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    } else {
      // Refetch notifications to update the UI
      refetchNotifications();
    }
  };

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return [];
      
      try {
        const { data: videos, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .or(`title.ilike.%${debouncedSearchQuery}%,channel_name.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`)
          .order('views', { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error searching videos:", error);
          toast.error("Failed to search videos");
          return [];
        }

        return videos || [];
      } catch (error) {
        console.error("Error in search query:", error);
        toast.error("Search failed. Please try again.");
        return [];
      }
    },
    enabled: debouncedSearchQuery.trim().length > 0,
    staleTime: 30000, // Cache results for 30 seconds
    retry: 2,
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Effect to maintain focus when popover opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="https://euincktvsiuztsxcuqfd.supabase.co/storage/v1/object/public/logos/play_button_outline_and_glyph.png" 
            alt="YidKik Logo"
            className="h-20 w-auto" 
            style={{ 
              objectFit: 'contain',
              minWidth: '80px',
              maxWidth: '80px'
            }}
            onError={(e) => {
              console.error('Logo failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>

        <div className="flex-1 flex justify-center px-4">
          <Popover 
            open={isSearchOpen} 
            onOpenChange={(open) => {
              setIsSearchOpen(open);
              if (!open) {
                setSearchQuery("");
              }
            }}
          >
            <PopoverTrigger asChild>
              <form onSubmit={handleSearch} className="w-full max-w-lg flex items-center">
                <div className="relative w-full flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#222222]" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      if (value.trim()) {
                        setIsSearchOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.trim()) {
                        setIsSearchOpen(true);
                      }
                    }}
                    className="w-full bg-transparent border-none text-sm text-[#222222] placeholder:text-[#222222]/60 focus:outline-none focus:ring-0"
                    autoComplete="off"
                  />
                </div>
              </form>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[400px] p-0 bg-white border border-gray-200 shadow-lg" 
              align="start"
              onInteractOutside={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
            >
              <ScrollArea className="h-[300px]">
                {isLoading ? (
                  <div className="p-4 text-sm text-gray-500">Searching...</div>
                ) : searchResults?.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No results found</div>
                ) : (
                  <div className="py-2">
                    {searchResults?.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => {
                          navigate(`/video/${video.id}`);
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium line-clamp-1">{video.title}</span>
                          <span className="text-xs text-gray-500">{video.channel_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          {session ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-[#222222] hover:bg-[#333333] text-white relative"
                    onClick={markNotificationsAsRead}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications && notifications.length > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#222222] border-[#333333] w-[300px]">
                  <ScrollArea className="h-[300px]">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 hover:bg-[#333333] cursor-pointer"
                          onClick={() => {
                            navigate(`/video/${notification.video_id}`);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={notification.youtube_videos.thumbnail}
                              alt={notification.youtube_videos.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="text-sm text-white line-clamp-2">
                                New video from {notification.youtube_videos.channel_name}
                              </p>
                              <p className="text-xs text-white/70 mt-1 line-clamp-1">
                                {notification.youtube_videos.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/70 p-4">No new notifications</p>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => setIsAuthOpen(true)}>Login</Button>
          )}
        </div>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </header>
  );
};

export default Header;