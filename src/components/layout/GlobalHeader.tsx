import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { session, isAuthenticated, handleSignOut } = useSessionManager();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isHomePage = location.pathname === "/";
  
  // Don't show header on homepage - it has its own hero section
  if (isHomePage) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50' 
            : 'bg-white/80 backdrop-blur-sm'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img 
                src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" 
                alt="YidVid" 
                className="w-10 h-10 object-contain"
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

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full hover:bg-primary/10"
                style={{ color: 'hsl(50, 100%, 40%)' }}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Auth Button - Desktop */}
              {!isMobile && (
                <>
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="rounded-full gap-2 border-gray-300 hover:bg-gray-100"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsAuthOpen(true)}
                      size="sm"
                      className="rounded-full gap-2"
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        backgroundColor: 'hsl(50, 100%, 50%)',
                        color: 'black'
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
                  className="rounded-full"
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobile && isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-t border-gray-200 overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive(link.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
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
                      className="w-full rounded-xl gap-2 justify-center py-6"
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
                      className="w-full rounded-xl gap-2 justify-center py-6"
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        backgroundColor: 'hsl(50, 100%, 50%)',
                        color: 'black'
                      }}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Auth Dialog */}
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};
