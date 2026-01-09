import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LogIn, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useIsMobile } from "@/hooks/use-mobile";
import Auth from "@/pages/Auth";
import { SearchModal } from "./SearchModal";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Videos", path: "/videos" },
  { name: "Channels", path: "/videos?view=channels" },
  { name: "Settings", path: "/settings" },
  { name: "About", path: "/about" },
];

export const GlobalHeader = () => {
  const location = useLocation();
  const { isMobile } = useIsMobile();
  const { isAuthenticated, handleSignOut } = useSessionManager();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const isHomePage = location.pathname === "/";
  
  // Don't show header on homepage - it has its own hero section
  if (isHomePage) {
    return null;
  }

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/videos?view=channels") {
      return location.pathname === "/videos" && location.search.includes("view=channels");
    }
    if (path === "/videos") {
      return location.pathname === "/videos" && !location.search.includes("view=channels");
    }
    return location.pathname === path;
  };

  return (
    <>
      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isVisible ? 0 : -100, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1]
        }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
      >
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left Side - Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img 
                src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" 
                alt="YidVid" 
                className="w-9 h-9 object-contain"
              />
              <span 
                className="text-xl font-bold hidden sm:block"
                style={{ 
                  fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                  color: '#333'
                }}
              >
                YidVid
              </span>
            </Link>

            {/* Right Side - Search, Navigation & Auth */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 hover:shadow-sm hover:border-gray-300"
                style={{ 
                  borderColor: '#e5e5e5',
                  backgroundColor: '#fafafa',
                  fontFamily: "'Quicksand', sans-serif"
                }}
              >
                <Search className="w-4 h-4 text-gray-500" />
                {!isMobile && (
                  <span className="text-sm font-medium text-gray-500">
                    Search
                  </span>
                )}
              </button>

              {/* Desktop Navigation */}
              {!isMobile && (
                <nav className="flex items-center gap-0.5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive(link.path)
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        backgroundColor: isActive(link.path) ? 'hsl(0, 70%, 55%)' : undefined
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              )}

              {/* Auth Button - Desktop */}
              {!isMobile && (
                <>
                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="rounded-full gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsAuthOpen(true)}
                      size="sm"
                      className="rounded-full gap-2 font-medium hover:opacity-90 transition-all"
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        backgroundColor: 'hsl(0, 70%, 55%)',
                        color: 'white'
                      }}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  )}
                </>
              )}

              {/* Mobile Menu Toggle */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-full h-9 w-9 text-gray-600"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu - Separate from header, positioned below */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-14 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-100"
            >
              <nav className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive(link.path)
                        ? 'text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={{ 
                      fontFamily: "'Quicksand', sans-serif",
                      backgroundColor: isActive(link.path) ? 'hsl(0, 70%, 55%)' : undefined
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile Auth Button */}
                <div className="pt-2 border-t border-gray-100 mt-2">
                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl gap-2 justify-center py-5 text-gray-600"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsAuthOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl gap-2 justify-center py-5 font-medium"
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        backgroundColor: 'hsl(0, 70%, 55%)',
                        color: 'white'
                      }}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Auth Dialog */}
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};
