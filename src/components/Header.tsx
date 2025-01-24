import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LayoutDashboard, Search, Info, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/utils/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => getTranslation(key, language);

  useEffect(() => {
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
                <SelectValue placeholder={t('allChannels')} />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] text-white border-none">
                <SelectItem value="all">{t('allChannels')}</SelectItem>
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
                placeholder={t('search')}
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
                    {t('noNotifications')}
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
                {t('signOut')}
              </Button>
            </>
          ) : (
            <Button onClick={onSignInClick} className="button-custom">{t('signIn')}</Button>
          )}
        </div>
      </div>

      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="bg-[#2A2A2A] text-white border-none max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">{t('welcomeToJewTube')}</DialogTitle>
            <DialogDescription className="text-gray-200 space-y-4">
              <p>
                {t('jewTubeDescription')}
              </p>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-white">{t('whatYouCanDo')}</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('browseCuratedContent')}</li>
                  <li>{t('searchTopics')}</li>
                  <li>{t('subscribeToChannels')}</li>
                  <li>{t('createAccount')}</li>
                  <li>{t('interactWithVideos')}</li>
                  <li>{t('customizeExperience')}</li>
                </ul>
              </div>

              <p className="mt-6">
                {t('whetherLooking')}
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  );
};
