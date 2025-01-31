import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, LayoutDashboard, Bell, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
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
          <form onSubmit={handleSearch} className="w-full max-w-lg flex items-center relative group">
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-[#555555] placeholder:text-[#555555] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Search 
              className="absolute right-2 w-4 h-4 text-[#555555] pointer-events-none" 
            />
          </form>
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
