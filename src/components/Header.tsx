
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { SearchBar } from "./header/SearchBar";
import { NotificationsMenu } from "./header/NotificationsMenu";
import { UserMenu } from "./header/UserMenu";
import { ContactDialog } from "./contact/ContactDialog";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (initialSession) {
          console.log("Initial session loaded:", initialSession.user?.email);
          setSession(initialSession);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event);
          switch (event) {
            case 'SIGNED_IN':
              setSession(currentSession);
              break;
            case 'TOKEN_REFRESHED':
              setSession(currentSession);
              break;
            case 'SIGNED_OUT':
              setSession(null);
              navigate('/');
              break;
            case 'USER_UPDATED':
              setSession(currentSession);
              break;
          }
        });

        return () => subscription?.unsubscribe();
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
        toast.error("There was an error with authentication. Please try logging in again.");
      }
    };

    initializeSession();
  }, [navigate]);

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast.error("There was an issue logging out");
        return;
      }
      setSession(null);
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto">
        {/* Main Header Row */}
        <div className="flex h-14 items-center justify-between px-2 md:px-4">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </Button>
            )}
            
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
                alt="YidVid Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>

          {/* Desktop Search Bar */}
          {!isMobile && (
            <div className="flex-1 max-w-xl mx-4">
              <SearchBar />
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-1 md:gap-2">
            {isMobile && !isSearchExpanded ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchExpanded(true)}
                className="mr-1"
              >
                <ChevronDown className="h-5 w-5 text-gray-600" />
              </Button>
            ) : null}

            {!isMobile && <ContactDialog />}

            {session ? (
              <>
                <NotificationsMenu 
                  session={session}
                  onMarkAsRead={markNotificationsAsRead}
                />
                <UserMenu onLogout={handleLogout} />
              </>
            ) : (
              <Button 
                onClick={() => setIsAuthOpen(true)}
                className="h-8 text-sm px-3"
                variant="default"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isMobile && isSearchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-2 py-2 border-t border-gray-100"
            >
              <SearchBar 
                onFocus={() => setIsSearchExpanded(true)}
                onClose={() => setIsSearchExpanded(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobile && isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-gray-100"
            >
              <nav className="py-2 px-4 space-y-2">
                <Link 
                  to="/"
                  className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <ContactDialog />
                {/* Add more mobile menu items as needed */}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </header>
  );
};
