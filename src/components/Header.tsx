
import { useState } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "./header/SearchBar";
import { HeaderLogo } from "./header/HeaderLogo";
import { HeaderActions } from "./header/HeaderActions";
import { MobileMenu } from "./header/MobileMenu";
import { useSessionManager } from "@/hooks/useSessionManager";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const isMobile = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, handleLogout } = useSessionManager();

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
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto">
        {/* Main Header Row */}
        <div className="flex h-14 items-center justify-between px-2 md:px-4 relative">
          <AnimatePresence mode="wait">
            {isMobile && isSearchExpanded ? (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center px-2 bg-white/95"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  duration: 0.3 
                }}
              >
                <SearchBar 
                  onClose={() => setIsSearchExpanded(false)}
                />
              </motion.div>
            ) : (
              <>
                <HeaderLogo 
                  isMobile={isMobile}
                  isMobileMenuOpen={isMobileMenuOpen}
                  onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                {/* Desktop Search Bar */}
                {!isMobile && (
                  <div className="flex-1 max-w-xl mx-4">
                    <SearchBar />
                  </div>
                )}

                <HeaderActions 
                  isMobile={isMobile}
                  isSearchExpanded={isSearchExpanded}
                  session={session}
                  onSearchExpand={() => setIsSearchExpanded(true)}
                  onAuthOpen={() => setIsAuthOpen(true)}
                />
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
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
