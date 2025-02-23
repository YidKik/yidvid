
import { Header } from "@/components/Header";
import Auth from "@/pages/Auth";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { CategorySection } from "@/components/categories/CategorySection";
import { ContentToggle } from "@/components/content/ContentToggle";
import { MusicSection } from "@/components/content/MusicSection";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionManager } from "@/hooks/useSessionManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GlobalNotification } from "@/components/notifications/GlobalNotification";
import { WelcomeOverlay } from "@/components/welcome/WelcomeOverlay";
import { getPageTitle, DEFAULT_META_DESCRIPTION, DEFAULT_META_KEYWORDS, DEFAULT_META_IMAGE } from "@/utils/pageTitle";
import { Helmet } from "react-helmet";
import { MostViewedVideos } from "@/components/video/MostViewedVideos";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube } from "lucide-react";

const MainContent = () => {
  const [isMusic, setIsMusic] = useState(false);
  const { data: videos, isLoading } = useVideos();
  const isMobile = useIsMobile();
  const { session, handleLogout } = useSessionManager();

  // Fetch channels
  const { data: channels } = useQuery({
    queryKey: ["youtube_channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .is("deleted_at", null);
      
      if (error) throw error;
      return data || [];
    }
  });

  const markNotificationsAsRead = async () => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from("video_notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <div className="flex-1">
      <Header />
      <GlobalNotification />
      <main className="mt-0 mx-auto px-2 md:px-6 max-w-[1400px]">
        <div className={`space-y-4 md:space-y-8`}>
          <div className="space-y-2">
            <div className="flex flex-col items-center">
              <ContentToggle 
                isMusic={isMusic} 
                onToggle={() => setIsMusic(!isMusic)} 
              />
              <CategorySection />
            </div>
          </div>

          {!isMusic && videos && videos.length > 0 && (
            <MostViewedVideos videos={videos} />
          )}

          <motion.div
            key={isMusic ? "music" : "videos"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={isMobile ? 'mt-0' : ''}
          >
            {!isMusic ? (
              <VideoContent videos={videos} isLoading={isLoading} />
            ) : (
              <MusicSection />
            )}
          </motion.div>

          {/* Channels Section */}
          {channels && channels.length > 0 && (
            <div className="mt-8 pb-8">
              <h2 className="text-xl font-semibold mb-4 px-4">Featured Channels</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 px-4">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex flex-col items-center">
                    <Avatar className="w-16 h-16 md:w-20 md:h-20">
                      <AvatarImage
                        src={channel.thumbnail_url}
                        alt={channel.title}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <Youtube className="w-8 h-8 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="mt-2 text-sm text-center line-clamp-2">{channel.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Initialize analytics or tracking if needed
    console.log("Index page mounted");
  }, []);

  return (
    <>
      <Helmet>
        <title>{getPageTitle('/')}</title>
        <meta name="description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="keywords" content={DEFAULT_META_KEYWORDS} />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content={getPageTitle('/')} />
        <meta property="og:description" content={DEFAULT_META_DESCRIPTION} />
        <meta property="og:image" content={DEFAULT_META_IMAGE} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle('/')} />
        <meta name="twitter:description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_META_IMAGE} />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
        <WelcomeOverlay />
        <WelcomeAnimation />
        <MainContent />
        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </>
  );
};

export default Index;
