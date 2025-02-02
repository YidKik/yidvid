import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, LayoutDashboard, Bell, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // First, clear ALL local storage to ensure no stale data
        localStorage.clear();
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (initialSession) {
          console.log("Initial session loaded:", initialSession.user?.email);
          setSession(initialSession);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event);
          
          switch (event) {
            case 'SIGNED_IN':
              console.log('User signed in:', currentSession?.user?.email);
              setSession(currentSession);
              break;
              
            case 'TOKEN_REFRESHED':
              console.log('Token refreshed successfully');
              setSession(currentSession);
              break;
              
            case 'SIGNED_OUT':
              console.log('User signed out');
              setSession(null);
              localStorage.clear();
              navigate('/');
              break;
              
            case 'USER_UPDATED':
              console.log('User updated');
              setSession(currentSession);
              break;
              
            case 'PASSWORD_RECOVERY':
              console.log('Password recovery initiated');
              break;
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing session:", error);
        // Clear everything and show error
        setSession(null);
        localStorage.clear();
        toast.error("There was an error with authentication. Please try logging in again.");
      }
    };

    initializeSession();
  }, [navigate]);

  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["video-notifications", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return [];
      }

      try {
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
          .eq("user_id", session.user.id)
          .eq("is_read", false)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching notifications:", error);
          throw error;
        }

        return notifications || [];
      } catch (error) {
        console.error("Error in notifications query:", error);
        toast.error("Failed to fetch notifications. Please try again later.");
        return [];
      }
    },
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: 1000,
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

  const handleLogout = async () => {
    try {
      // First clear all state and storage
      setSession(null);
      localStorage.clear();
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // This ensures all sessions are terminated
      });
      
      if (error) {
        console.error("Error during logout:", error);
        // Only show error if it's not the common "Session not found" error
        if (error.message !== "Session from session_id claim in JWT does not exist") {
          toast.error("There was an issue logging out");
        }
      }
      
      // Always navigate and show success
      navigate("/");
      toast.success("Logged out successfully");
      
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      // Even if there's an error, we want to clear state and redirect
      navigate("/");
    }
  };

  const { data: searchResults } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return [];
      
      try {
        const { data: videos, error } = await supabase
          .from("youtube_videos")
          .select("id, title, thumbnail, channel_name")
          .or(`title.ilike.%${debouncedSearch}%, channel_name.ilike.%${debouncedSearch}%`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error searching videos:", error);
          throw error;
        }

        return videos || [];
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search videos. Please try again later.");
        return [];
      }
    },
    enabled: debouncedSearch.length > 0,
    retry: 2,
    staleTime: 1000 * 60,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="https://euincktvsiuztsxcuqfd.supabase.co/storage/v1/object/public/logos/play_button_outline_and_glyph.png" 
            alt="YidKik Logo"
            className="h-12 w-12 md:h-20 md:w-20 object-contain min-h-[50px] min-w-[50px] md:min-h-[80px] md:min-w-[80px] max-h-[50px] max-w-[50px] md:max-h-[80px] md:max-w-[80px]"
            onError={(e) => {
              console.error('Logo failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>

        <div className="flex-1 flex justify-center px-2 md:px-4">
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
              className="w-full bg-transparent border-none text-[#555555] placeholder:text-[#555555] focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
            />
            <Search 
              className="absolute right-2 w-4 h-4 text-[#555555] pointer-events-none" 
            />
            {showResults && searchResults && searchResults.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50 max-w-[calc(100vw-2rem)] md:max-w-none mx-auto"
                onMouseDown={(e) => e.preventDefault()}
              >
                <ScrollArea className="h-[300px] md:h-[400px] overflow-y-auto scrollbar-hide">
                  <div className="p-1">
                    {searchResults.map((video) => (
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
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          {session ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-[#222222] hover:bg-[#333333] text-white relative h-7 w-7 md:h-10 md:w-10"
                  >
                    <Bell className="h-3.5 w-3.5 md:h-5 md:w-5" />
                    {notifications && notifications.length > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 md:h-5 md:w-5 flex items-center justify-center p-0 text-[8px] md:text-xs"
                      >
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-[#222222] border-[#333333] w-[280px] md:w-[300px] max-h-[60vh] md:max-h-[70vh]"
                >
                  <ScrollArea className="h-[250px] md:h-[300px]">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-2 md:p-3 hover:bg-[#333333] cursor-pointer"
                          onClick={() => {
                            navigate(`/video/${notification.video_id}`);
                            markNotificationsAsRead();
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <img
                              src={notification.youtube_videos.thumbnail}
                              alt={notification.youtube_videos.title}
                              className="w-14 h-10 md:w-16 md:h-12 object-cover rounded"
                            />
                            <div>
                              <p className="text-xs md:text-sm text-white line-clamp-2">
                                New video from {notification.youtube_videos.channel_name}
                              </p>
                              <p className="text-[10px] md:text-xs text-white/70 mt-0.5 line-clamp-1">
                                {notification.youtube_videos.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs md:text-sm text-white/70 p-3">No new notifications</p>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 md:h-10 md:w-10"
                  >
                    <Settings className="h-3.5 w-3.5 md:h-5 md:w-5" />
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
            <Button 
              onClick={() => setIsAuthOpen(true)}
              className="h-7 md:h-10 text-xs md:text-sm px-2 md:px-4"
            >
              Login
            </Button>
          )}
        </div>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </header>
  );
};

export default Header;
