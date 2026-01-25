import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, LogIn, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useIsMobile } from "@/hooks/use-mobile";
import Auth from "@/pages/Auth";
import yidvidLogoIcon from "@/assets/yidvid-logo-icon.png";

export const GlobalHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { isAuthenticated, session, profile } = useSessionManager();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const isHomePage = location.pathname === "/";

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      
      // Only hide after scrolling down past 100px
      if (scrollingDown && currentScrollY > 100) {
        setIsVisible(false);
      } else if (!scrollingDown) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      searchInputRef.current?.blur();
    }
  };

  // Get user initial for profile icon
  const getUserInitial = () => {
    if (profile?.display_name) {
      return profile.display_name.charAt(0).toUpperCase();
    }
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isVisible ? 0 : -70, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/95"
        style={{ 
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="w-full px-3 md:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Left Side - Logo Only */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img 
                src={yidvidLogoIcon} 
                alt="YidVid" 
                className="w-9 h-9 object-contain"
              />
              {!isMobile && (
                <span 
                  className="text-lg font-bold"
                  style={{ 
                    fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                    color: '#333'
                  }}
                >
                  YidVid
                </span>
              )}
            </Link>

            {/* Center - Search Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-xl"
            >
              <div 
                className={`flex items-center rounded-full border transition-all duration-200 ${
                  isSearchFocused 
                    ? 'border-gray-400 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: '#fafafa' }}
              >
                <div className="flex items-center flex-1 px-4">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder={isMobile ? "Search..." : "Search videos, channels..."}
                    className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-r-full border-l border-gray-200 hover:bg-gray-100 transition-colors"
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </form>

            {/* Right Side - Sign In / Profile */}
            <div className="flex items-center shrink-0">
              {isAuthenticated ? (
                <Link
                  to="/settings"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white font-semibold text-sm transition-transform hover:scale-105"
                  style={{ 
                    backgroundColor: 'hsl(0, 70%, 55%)',
                    fontFamily: "'Quicksand', sans-serif"
                  }}
                  title="Profile"
                >
                  {getUserInitial()}
                </Link>
              ) : (
                <Button
                  onClick={() => setIsAuthOpen(true)}
                  size={isMobile ? "sm" : "default"}
                  className="rounded-full gap-2 font-medium hover:opacity-90 transition-all"
                  style={{ 
                    fontFamily: "'Quicksand', sans-serif",
                    backgroundColor: 'hsl(0, 70%, 55%)',
                    color: 'white'
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  {!isMobile && <span>Sign In</span>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Auth Dialog */}
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};
