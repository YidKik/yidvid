
import { useState } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "./header/SearchBar";
import { HeaderLogo } from "./header/HeaderLogo";
import { HeaderActions } from "./header/HeaderActions";
import { MobileMenu } from "./header/MobileMenu";
import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Header = () => {
  const isMobile = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, handleLogout } = useAuth();
  const queryClient = useQueryClient();
  const [isMarkingNotifications, setIsMarkingNotifications] = useState(false);

  const markNotificationsAsRead = async () => {
    if (!session?.user?.id || isMarkingNotifications) return;

    setIsMarkingNotifications(true);
    try {
      const { error } = await supabase
        .from("video_notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking notifications as read:", error);
        // Silent error - don't show toast to users to prevent duplicates
      }
      
      // Refetch notifications to update the UI
      queryClient.invalidateQueries({ queryKey: ["video-notifications", session?.user?.id] });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    } finally {
      setIsMarkingNotifications(false);
    }
  };

  const handleSettingsClick = () => {
    // Force refresh the user-profile data when settings menu is opened
    if (session?.user?.id) {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b ${isMobile ? 'h-14 bg-white' : 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'}`}>
      <div className="container mx-auto px-0">
        <div className="flex h-14 items-center relative">
          <AnimatePresence mode="wait">
            {isMobile && isSearchExpanded ? (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center px-2 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-full max-w-[90%] mx-auto"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3 
                  }}
                >
                  <SearchBar 
                    onClose={() => setIsSearchExpanded(false)}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <>
                <div className="flex-none pl-2">
                  <HeaderLogo 
                    isMobile={isMobile}
                    isMobileMenuOpen={isMobileMenuOpen}
                    onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  />
                </div>

                {!isMobile && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl mx-auto px-4">
                    <div className="w-full max-w-xl">
                      <SearchBar />
                    </div>
                  </div>
                )}

                <div className="ml-auto pr-4">
                  <HeaderActions 
                    isMobile={isMobile}
                    isSearchExpanded={isSearchExpanded}
                    session={session}
                    onSearchExpand={() => setIsSearchExpanded(true)}
                    onAuthOpen={() => setIsAuthOpen(true)}
                    onLogout={handleLogout}
                    onMarkNotificationsAsRead={markNotificationsAsRead}
                    onSettingsClick={handleSettingsClick}
                  />
                </div>
              </>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isMobile && (
            <MobileMenu 
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </header>
  );
};
