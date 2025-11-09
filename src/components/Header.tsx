
import { useState, useEffect } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeaderActions } from "./header/HeaderActions";
import { MobileMenu } from "./header/MobileMenu";
import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { HeaderLogo } from "./header/HeaderLogo";
import { VideoSearchBar } from "./header/VideoSearchBar";
import { CategoryToggle } from "./header/CategoryToggle";
import { MobileVideosHeader } from "./header/mobile/MobileVideosHeader";

export const Header = ({ selectedCategory, onCategoryChange }: { selectedCategory?: string; onCategoryChange?: (category: string) => void } = {}) => {
  const { isMobile } = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, handleLogout } = useAuth();
  const queryClient = useQueryClient();
  const [isMarkingNotifications, setIsMarkingNotifications] = useState(false);
  const location = useLocation();
  
  // Determine if we're on the home page
  const isHomePage = location.pathname === "/";
  const isVideosPage = location.pathname === "/videos";
  const isSearchPage = location.pathname === "/search";
  
  // Header animation states
  const [scrolled, setScrolled] = useState(false);
  // Use fixed header on desktop videos page to guarantee persistent visibility
  const headerPositionClass = isVideosPage && !isMobile ? 'fixed top-0 left-0 right-0' : 'sticky top-0';
  const needsSpacer = isVideosPage && !isMobile;

  // Enhanced scroll detection for blurred background effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state for styling - always show with blur when scrolled
      setScrolled(currentScrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Listen for the custom auth dialog event
  useEffect(() => {
    const handleOpenAuthDialog = () => {
      setIsAuthOpen(true);
    };
    
    document.addEventListener('openAuthDialog', handleOpenAuthDialog);
    
    return () => {
      document.removeEventListener('openAuthDialog', handleOpenAuthDialog);
    };
  }, []);

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
    <>
      <motion.header 
        className={`${headerPositionClass} z-50 w-full max-w-[100vw] border-b bg-white/25 backdrop-blur-lg supports-[backdrop-filter]:bg-white/20 transition-all duration-300 ${
          scrolled 
            ? 'border-primary/60 shadow-sm' 
            : 'border-gray-200'
        } ${isMobile ? 'h-14' : ''} ${isVideosPage ? 'videos-page' : isHomePage ? 'home-page' : ''}`}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
      >
      <div className="container mx-auto px-0 max-w-[100vw]">
        <div className={`flex ${isMobile ? 'h-14' : 'h-14'} items-center relative max-w-[100vw]`}>
          {isMobile ? (
            <>
              {isVideosPage ? (
                <div className="w-full flex flex-col">
                  <MobileVideosHeader
                    session={session}
                    selectedCategory={selectedCategory}
                    onCategoryChange={onCategoryChange}
                    onAuthOpen={() => setIsAuthOpen(true)}
                    handleSettingsClick={handleSettingsClick}
                    onMarkNotificationsAsRead={markNotificationsAsRead}
                  />
                </div>
              ) : (
                <div className="w-full flex items-center px-3">
                  <div className="w-1/5 flex justify-start">
                    <HeaderLogo
                      isMobile={isMobile}
                      isMobileMenuOpen={isMobileMenuOpen}
                      onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                  </div>
                  
                  {isSearchPage && (
                    <div className="w-3/5 flex justify-center items-center gap-2 px-2">
                      <div className="flex-1">
                        <VideoSearchBar />
                      </div>
                    </div>
                  )}

                  <div className="w-1/5 flex justify-end">
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
              )}
            </>
          ) : (
            <>
              <HeaderLogo
                isMobile={isMobile}
                isMobileMenuOpen={isMobileMenuOpen}
                onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
              
              {(isVideosPage || isSearchPage) && (
                <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-auto px-6">
                  <div className="w-full max-w-lg mx-auto flex items-center gap-3">
                    {isVideosPage && selectedCategory && onCategoryChange && (
                      <CategoryToggle 
                        selectedCategory={selectedCategory}
                        onCategoryChange={onCategoryChange}
                      />
                    )}
                    <div className="flex-1">
                      <VideoSearchBar />
                    </div>
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
    </motion.header>
    {needsSpacer && !isMobile && <div className="h-14 w-full" aria-hidden="true" />}
    </>
  );
};
