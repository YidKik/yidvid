
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
    <header className={`sticky top-0 z-50 w-full border-b ${isMobile ? 'h-20 bg-white' : 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'}`}>
      <div className="container mx-auto px-0">
        <div className={`flex ${isMobile ? 'h-20' : 'h-14'} items-center relative`}>
          {isMobile ? (
            <div className="w-full flex items-center px-2 justify-between">
              <div className="w-1/4 flex justify-start">
                <HeaderLogo 
                  isMobile={isMobile}
                  isMobileMenuOpen={isMobileMenuOpen}
                  onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              </div>
              
              <div className="w-2/4 px-1">
                <SearchBar />
              </div>

              <div className="w-1/4 flex justify-end">
                <HeaderActions 
                  isMobile={isMobile}
                  isSearchExpanded={isSearchExpanded}
                  session={session}
                  onSearchExpand={() => {}}
                  onAuthOpen={() => setIsAuthOpen(true)}
                  onLogout={handleLogout}
                  onMarkNotificationsAsRead={markNotificationsAsRead}
                  onSettingsClick={handleSettingsClick}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex-none pl-2">
                <HeaderLogo 
                  isMobile={isMobile}
                  isMobileMenuOpen={isMobileMenuOpen}
                  onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl mx-auto px-4">
                <div className="w-full max-w-xl">
                  <SearchBar />
                </div>
              </div>

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
