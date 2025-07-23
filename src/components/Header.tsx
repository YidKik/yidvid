
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
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Enhanced scroll detection with direction and visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      setScrollDirection(direction);
      
      // Visibility logic - only hide header on homepage when scrolling down past threshold
      if (isHomePage) {
        if (direction === 'down' && currentScrollY > 100) {
          setIsVisible(false);
        } else if (direction === 'up') {
          setIsVisible(true);
        }
      } else {
        // Always visible on other pages
        setIsVisible(true);
      }
      
      // Set scrolled state for styling
      setScrolled(currentScrollY > 20);
      
      // Update last scroll position
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isHomePage]);

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
    <motion.header 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-white/20 backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border-primary/50' 
          : isMobile 
            ? 'h-14 bg-white/30 backdrop-blur-md' 
            : 'bg-white/30 backdrop-blur-md'
      } ${isVideosPage ? 'videos-page' : isHomePage ? 'home-page' : ''}`}
      initial={{ opacity: 1, y: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : -100,
        transition: {
          duration: 0.4,
          ease: "easeInOut"
        }
      }}
    >
      <div className="container mx-auto px-0">
        <div className={`flex ${isMobile ? 'h-14' : 'h-14'} items-center relative`}>
          {isMobile ? (
            <div className="w-full flex items-center px-3">
              <div className="w-1/5 flex justify-start">
                <HeaderLogo
                  isMobile={isMobile}
                  isMobileMenuOpen={isMobileMenuOpen}
                  onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              </div>
              
              {(isVideosPage || isSearchPage) && (
                <div className="w-3/5 flex justify-center items-center gap-2 px-2">
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
  );
};
