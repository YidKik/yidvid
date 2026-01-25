import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  PlayCircle, 
  Settings, 
  Info, 
  LogIn, 
  LogOut, 
  Bell, 
  Heart, 
  Clock, 
  History, 
  ListVideo,
  TrendingUp,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionManager } from "@/hooks/useSessionManager";
import yidvidLogoIcon from "@/assets/yidvid-logo-icon.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthOpen: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title?: string;
  items: NavItem[];
  requiresAuth?: boolean;
}

const navSections: NavSection[] = [
  {
    items: [
      { name: "Home", path: "/", icon: Home },
      { name: "Videos", path: "/videos", icon: PlayCircle },
      { name: "Trending", path: "/videos?category=all", icon: TrendingUp },
    ]
  },
  {
    title: "Explore",
    items: [
      { name: "New Videos", path: "/videos?sort=new", icon: Sparkles },
      { name: "Channels", path: "/settings", icon: Users },
    ]
  },
  {
    title: "Your Library",
    requiresAuth: true,
    items: [
      { name: "Watch History", path: "/dashboard", icon: History },
      { name: "Favorites", path: "/dashboard", icon: Heart },
      { name: "Watch Later", path: "/dashboard", icon: Clock },
    ]
  },
  {
    title: "More",
    items: [
      { name: "Settings", path: "/settings", icon: Settings },
      { name: "About", path: "/about", icon: Info },
    ]
  }
];

export const Sidebar = ({ isOpen, onClose, onAuthOpen }: SidebarProps) => {
  const location = useLocation();
  const { isAuthenticated, handleSignOut } = useSessionManager();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Your Library"]);

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, location.search]);

  const isActive = (path: string) => {
    const [basePath, query] = path.split("?");
    if (query) {
      return location.pathname === basePath && location.search.includes(query.split("=")[1]);
    }
    return location.pathname === basePath;
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          
          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-white shadow-2xl flex flex-col"
            style={{ 
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
              fontFamily: "'Quicksand', sans-serif"
            }}
          >
            {/* Header with Logo */}
            <div className="h-14 px-4 flex items-center gap-3 border-b border-gray-100">
              <Link to="/" className="flex items-center gap-2" onClick={onClose}>
                <img 
                  src={yidvidLogoIcon} 
                  alt="YidVid" 
                  className="w-8 h-8 object-contain"
                />
                <span 
                  className="text-lg font-bold"
                  style={{ 
                    fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                    color: '#333'
                  }}
                >
                  YidVid
                </span>
              </Link>
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              {navSections.map((section, sectionIdx) => {
                // Skip auth-required sections if not authenticated
                if (section.requiresAuth && !isAuthenticated) return null;
                
                const isSectionExpanded = !section.title || expandedSections.includes(section.title);
                
                return (
                  <div key={sectionIdx} className={sectionIdx > 0 ? "mt-2 pt-2 border-t border-gray-100" : ""}>
                    {/* Section Header */}
                    {section.title && (
                      <button
                        onClick={() => toggleSection(section.title!)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {section.title}
                        {isSectionExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    
                    {/* Section Items */}
                    <AnimatePresence>
                      {isSectionExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            
                            return (
                              <Link
                                key={item.path + item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  active
                                    ? 'text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                style={{
                                  backgroundColor: active ? 'hsl(0, 70%, 55%)' : undefined,
                                }}
                              >
                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Footer - Auth */}
            <div className="p-3 border-t border-gray-100">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleSignOut();
                    onClose();
                  }}
                  className="w-full rounded-xl gap-3 justify-start py-5 text-gray-600 hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    onAuthOpen();
                    onClose();
                  }}
                  className="w-full rounded-xl gap-3 justify-center py-5 font-semibold text-white hover:opacity-90 transition-all"
                  style={{ 
                    backgroundColor: 'hsl(0, 70%, 55%)',
                  }}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
