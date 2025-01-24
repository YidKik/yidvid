import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LayoutDashboard, Search, Info, Compass, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import Joyride, { CallBackProps, STATUS, ACTIONS, Placement, Status } from 'react-joyride';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onSignInClick?: () => void;
}

interface Notification {
  id: string;
  video_id: string;
  is_read: boolean;
  video: {
    title: string;
    channel_name: string;
  };
}

export const Header = ({ onSignInClick }: HeaderProps) => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string }>>([]);
  const [channels, setChannels] = useState<Array<{ channel_id: string; title: string }>>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [showTourDialog, setShowTourDialog] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const tourSteps = [
    {
      target: '.search-custom',
      content: 'Welcome to JewTube! Start your journey by searching for videos or browsing by channel using our powerful search feature.',
      placement: 'bottom' as Placement,
      disableBeacon: true,
      spotlightPadding: 0,
      styles: {
        options: {
          backgroundColor: '#F1F0FB',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      },
    },
    {
      target: '.button-custom',
      content: 'Access your account settings, customize your experience, and manage your profile here.',
      placement: 'left' as Placement,
      styles: {
        options: {
          backgroundColor: '#F1F0FB',
          borderRadius: '8px',
          padding: '20px',
        },
      },
      spotlightPadding: 5,
    },
    {
      target: '.video-grid',
      content: 'Browse through our curated collection of Jewish videos from various channels.',
      placement: 'top' as Placement,
      styles: {
        options: {
          backgroundColor: '#F1F0FB',
          borderRadius: '8px',
          padding: '20px',
        },
      },
      disableBeacon: true,
      spotlightPadding: 10,
    },
    {
      target: '.channels-grid',
      content: 'Discover and subscribe to your favorite Jewish content creators.',
      placement: 'top' as Placement,
      styles: {
        options: {
          backgroundColor: '#F1F0FB',
          borderRadius: '8px',
          padding: '20px',
        },
      },
      disableBeacon: true,
      spotlightPadding: 10,
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: Status[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || action === ACTIONS.CLOSE) {
      setRunTour(false);
      setTimeout(scrollToTop, 100);
      return;
    }

    // Handle scrolling for specific steps
    if (type === 'step:after' || action === ACTIONS.START) {
      const nextIndex = action === ACTIONS.START ? 0 : index + 1;
      
      // If we're moving to the first step or going back to it, scroll to top
      if (nextIndex === 0) {
        setTimeout(scrollToTop, 300);
        return;
      }

      // Handle scrolling for video grid and channels grid
      if (nextIndex < tourSteps.length) {
        const nextTarget = document.querySelector(tourSteps[nextIndex].target);
        if (nextTarget && (nextIndex === 2 || nextIndex === 3)) {
          setTimeout(() => {
            const offset = nextIndex === 2 ? -50 : 0; // Adjust offset for video grid
            const elementPosition = nextTarget.getBoundingClientRect().top + window.pageYOffset + offset;
            window.scrollTo({
              top: elementPosition,
              behavior: 'smooth'
            });
          }, 300);
        } else {
          // For other steps, ensure we're at the top
          setTimeout(scrollToTop, 300);
        }
      }
    }

    // Handle back button
    if (action === ACTIONS.PREV) {
      const prevIndex = index - 1;
      if (prevIndex <= 1) { // If going back to first or second step
        setTimeout(scrollToTop, 300);
      }
    }
  };

  useEffect(() => {
    // Check if it's the first visit
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setShowTourDialog(true);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
        fetchNotifications();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
        fetchNotifications();
      }
    });

    // Fetch channels
    fetchChannels();

    return () => subscription.unsubscribe();
  }, []);

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from('youtube_channels')
      .select('channel_id, title')
      .order('title');
    
    if (error) {
      console.error('Error fetching channels:', error);
      return;
    }
    
    setChannels(data || []);
  };

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return;
    }
    
    setIsAdmin(data?.is_admin || false);
  };

  const fetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('video_notifications')
      .select(`
        id,
        video_id,
        is_read,
        video:youtube_videos (
          title,
          channel_name
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setNotifications(data as Notification[]);
  };

  const handleNotificationClick = async (notificationId: string, videoId: string) => {
    // Mark notification as read
    const { error } = await supabase
      .from('video_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    // Navigate to video
    navigate(`/video/${videoId}`);
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}${selectedChannel !== 'all' ? `&channel=${selectedChannel}` : ''}`);
      setShowDropdown(false);
    }
  };

  const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      let query = supabase
        .from('youtube_videos')
        .select('id, title')
        .ilike('title', `%${value}%`)
        .limit(5);

      if (selectedChannel !== 'all') {
        query = query.eq('channel_id', selectedChannel);
      }
      
      const { data, error } = await query;
      
      if (!error && data) {
        setSearchResults(data);
        setShowDropdown(true);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const handleResultClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleStartTour = () => {
    setShowTourDialog(false);
    localStorage.setItem('hasVisitedBefore', 'true');
    setRunTour(true);
  };

  const handleSkipTour = () => {
    setShowTourDialog(false);
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  const handleNotificationsOpen = async (isOpen: boolean) => {
    if (isOpen) {
      // When opening the dropdown, mark all notifications as read
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('video_notifications')
          .update({ is_read: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false);

        if (error) {
          console.error('Error marking notifications as read:', error);
          toast.error("Failed to update notifications");
          return;
        }

        // Update local state to reflect the changes
        setNotifications(notifications.map(notification => ({
          ...notification,
          is_read: true
        })));
      }
    }
    setShowNotifications(isOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-custom border-b border-gray-200 z-50 px-4">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        hideCloseButton
        disableOverlayClose
        spotlightClicks
        scrollToFirstStep={false}
        disableScrollParentFix={false}
        styles={{
          options: {
            arrowColor: '#F1F0FB',
            backgroundColor: '#F1F0FB',
            overlayColor: 'rgba(0, 0, 0, 0.85)',
            primaryColor: '#FF0000',
            textColor: '#1A1F2C',
            zIndex: 1000,
          },
        }}
        callback={handleJoyrideCallback}
        floaterProps={{
          disableAnimation: true,
          styles: {
            floater: {
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
            },
          },
        }}
      />
      
      <div className="flex items-center justify-between h-full max-w-[1800px] mx-auto">
        <div className="flex items-center">
          <Link to="/">
            <h1 className="text-2xl font-bold logo-custom">JewTube</h1>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
          <div className="relative group flex gap-2 search-custom">
            <Select
              value={selectedChannel}
              onValueChange={setSelectedChannel}
            >
              <SelectTrigger className="w-[140px] h-10 bg-[#2A2A2A] text-white border-none rounded-full">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] text-white border-none">
                <SelectItem value="all">All Channels</SelectItem>
                {channels.map((channel) => (
                  <SelectItem key={channel.channel_id} value={channel.channel_id}>
                    {channel.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search..."
                className="w-full h-10 bg-[#222] text-white border-none rounded-full px-6 py-2 focus:outline-none focus:ring-0 transition-all duration-300 placeholder:text-gray-400 flex-grow"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute w-full mt-2 bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.id)}
                      className="w-full px-4 py-3 text-left text-gray-200 hover:bg-[#3A3A3A] transition-colors duration-200"
                    >
                      {result.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="flex items-center gap-2">
          {session && (
            <DropdownMenu open={showNotifications} onOpenChange={handleNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-[#2A2A2A] text-white border-none">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-300">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-[#3A3A3A]`}
                      onClick={() => handleNotificationClick(notification.id, notification.video_id)}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-white">
                          {notification.video.channel_name}
                        </span>
                        <span className="text-sm text-gray-300">
                          {notification.video.title}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRunTour(true)}
            className="relative button-custom"
          >
            <Compass className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAboutDialog(true)}
            className="relative button-custom"
          >
            <Info className="h-4 w-4" />
          </Button>
          {session ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDashboardClick}
                  className="relative button-custom"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSettingsClick}
                className="button-custom"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="button-custom"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={onSignInClick} className="button-custom">Sign In</Button>
          )}
        </div>
      </div>

      <Dialog open={showTourDialog} onOpenChange={setShowTourDialog}>
        <DialogContent className="bg-[#2A2A2A] text-white border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-2">Welcome to JewTube!</DialogTitle>
            <DialogDescription className="text-gray-200">
              Would you like to take a quick tour to learn about the main features of our platform?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={handleSkipTour}>
              Skip Tour
            </Button>
            <Button onClick={handleStartTour}>
              Start Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="bg-[#2A2A2A] text-white border-none max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">Welcome to JewTube!</DialogTitle>
            <DialogDescription className="text-gray-200 space-y-4">
              <p>
                JewTube is your dedicated platform for discovering and engaging with Jewish content from various YouTube channels. Our mission is to create a centralized hub where you can easily find, watch, and interact with meaningful Jewish content.
              </p>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-white">What you can do here:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Browse curated Jewish content from various YouTube channels</li>
                  <li>Search for specific topics or channels</li>
                  <li>Subscribe to your favorite channels to stay updated</li>
                  <li>Create an account to personalize your experience</li>
                  <li>Interact with videos through likes and comments</li>
                  <li>Customize your viewing experience with theme settings</li>
                </ul>
              </div>

              <p className="mt-6">
                Whether you're looking for Torah lessons, Jewish music, cultural content, or educational materials, JewTube makes it easy to find exactly what you're looking for in one place.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  );
};
