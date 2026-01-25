import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  PlayCircle, 
  Settings, 
  Info, 
  Heart, 
  Clock, 
  History, 
  TrendingUp,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
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
    title: "Library",
    requiresAuth: true,
    items: [
      { name: "History", path: "/dashboard", icon: History },
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

interface SidebarProps {
  isAuthenticated?: boolean;
}

export const Sidebar = ({ isAuthenticated = false }: SidebarProps) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show on homepage
  const isHomePage = location.pathname === "/";
  if (isHomePage) return null;

  const isActive = (path: string) => {
    const [basePath, query] = path.split("?");
    if (query) {
      return location.pathname === basePath && location.search.includes(query.split("=")[1]);
    }
    return location.pathname === basePath;
  };

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/20"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 220 : 64 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-14 left-0 bottom-0 z-40 bg-white border-r border-gray-100 flex flex-col overflow-hidden"
        style={{ 
          boxShadow: isExpanded ? '2px 0 12px rgba(0, 0, 0, 0.08)' : 'none',
          fontFamily: "'Quicksand', sans-serif"
        }}
      >
        {/* Toggle Button */}
        <div className={cn("p-2 border-b border-gray-100", isExpanded ? "px-3" : "px-2")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors",
              isExpanded ? "w-full justify-start gap-2" : "w-10 h-10 p-0"
            )}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {navSections.map((section, sectionIdx) => {
            // Skip auth-required sections if not authenticated
            if (section.requiresAuth && !isAuthenticated) return null;
            
            return (
              <div key={sectionIdx} className={sectionIdx > 0 ? "mt-3 pt-3 border-t border-gray-100" : ""}>
                {/* Section Header - Only show when expanded */}
                {section.title && isExpanded && (
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                
                {/* Section Items */}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link
                        key={item.path + item.name}
                        to={item.path}
                        onClick={() => setIsExpanded(false)}
                        title={!isExpanded ? item.name : undefined}
                        className={cn(
                          "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                          isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5",
                          active
                            ? 'text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        )}
                        style={{
                          backgroundColor: active ? 'hsl(0, 70%, 55%)' : undefined,
                        }}
                      >
                        <Icon className={cn("w-5 h-5 shrink-0", active ? 'text-white' : 'text-gray-500')} />
                        {isExpanded && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};
