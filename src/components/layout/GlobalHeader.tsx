import { useState, useEffect } from "react";
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
  
  const isHomePage = location.pathname === "/";
  
  // Don't show header on homepage - it has its own hero section
  if (isHomePage) {
    return null;
  }

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
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
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
                  color: 'hsl(180, 100%, 13%)'
                }}
              >
                YidVid
              </span>
            </Link>

            {/* Center - Search Button (Desktop) */}
            {!isMobile && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-full border-2 transition-all duration-200 hover:shadow-md"
                style={{ 
                  borderColor: 'hsl(50, 100%, 50%)',
                  backgroundColor: 'hsl(50, 100%, 97%)',
                  fontFamily: "'Quicksand', sans-serif"
                }}
              >
                <Search className="w-4 h-4" style={{ color: 'hsl(50, 100%, 35%)' }} />
                <span className="text-sm font-medium" style={{ color: 'hsl(50, 100%, 30%)' }}>
                  Search videos...
                </span>
              </button>
            )}

            {/* Right Side - Navigation & Auth */}
            <div className="flex items-center gap-1">
              {/* Desktop Navigation */}
              {!isMobile && (
                <nav className="flex items-center gap-1 mr-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                        isActive(link.path)
                          ? 'text-white'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        backgroundColor: isActive(link.path) ? 'hsl(180, 100%, 13%)' : undefined
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              )}

              {/* Mobile Search Button */}
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="rounded-full gap-1.5 mr-1"
                  style={{ 
                    borderColor: 'hsl(50, 100%, 50%)',
                    backgroundColor: 'hsl(50, 100%, 97%)',
                    color: 'hsl(50, 100%, 30%)'
                  }}
                >
                  <Search className="w-4 h-4" />
                  <span className="text-xs font-medium">Search</span>
                </Button>
              )}

              {/* Auth Button - Desktop */}
              {!isMobile && (
                <>
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="rounded-full gap-2 border-gray-300 hover:bg-gray-100"
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        color: '#333'
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsAuthOpen(true)}
                      size="sm"
                      className="rounded-full gap-2 font-semibold hover:opacity-90"
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        backgroundColor: 'hsl(180, 100%, 13%)',
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
                  className="rounded-full h-9 w-9"
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
      </header>

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
              className="fixed top-14 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg"
            >
              <nav className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive(link.path)
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{ 
                      fontFamily: "'Quicksand', sans-serif",
                      backgroundColor: isActive(link.path) ? 'hsl(180, 100%, 13%)' : undefined
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile Auth Button */}
                <div className="pt-2 border-t border-gray-200 mt-2">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl gap-2 justify-center py-5 border-gray-300"
                      style={{ fontFamily: "'Quicksand', sans-serif", color: '#333' }}
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
                      className="w-full rounded-xl gap-2 justify-center py-5 font-semibold"
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        backgroundColor: 'hsl(180, 100%, 13%)',
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

      {/* Spacer for fixed header */}
      <div className="h-14" />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Auth Dialog */}
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};
