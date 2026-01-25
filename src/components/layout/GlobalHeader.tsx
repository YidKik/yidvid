import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import Auth from "@/pages/Auth";
import { SearchModal } from "./SearchModal";
import { Sidebar } from "./Sidebar";
import yidvidLogoIcon from "@/assets/yidvid-logo-icon.png";

export const GlobalHeader = () => {
  const location = useLocation();
  const { isMobile } = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  
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

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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
          <div className="flex items-center justify-between h-14">
            {/* Left Side - Menu Toggle & Logo */}
            <div className="flex items-center gap-2">
              {/* Hamburger Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-full h-10 w-10 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <img 
                  src={yidvidLogoIcon} 
                  alt="YidVid" 
                  className="w-8 h-8 object-contain"
                />
                <span 
                  className="text-lg font-bold hidden sm:block"
                  style={{ 
                    fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                    color: '#333'
                  }}
                >
                  YidVid
                </span>
              </Link>
            </div>

            {/* Center - Search Bar (Desktop) */}
            {!isMobile && (
              <div className="flex-1 max-w-xl mx-4">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-200 hover:shadow-sm hover:border-gray-300"
                  style={{ 
                    borderColor: '#e5e5e5',
                    backgroundColor: '#fafafa',
                    fontFamily: "'Quicksand', sans-serif"
                  }}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Search videos, channels...
                  </span>
                </button>
              </div>
            )}

            {/* Right Side - Search (Mobile) */}
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="rounded-full h-10 w-10 text-gray-600 hover:bg-gray-100"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onAuthOpen={() => setIsAuthOpen(true)}
      />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Auth Dialog */}
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};
