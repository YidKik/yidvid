import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  PlayCircle, 
  Settings, 
  Info, 
  Heart, 
  Clock, 
  History, 
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Bell,
  ArrowLeft,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import yidvidLogoIcon from "@/assets/yidvid-logo-icon.png";
import { useCategories } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  getPreviousPath, 
  getScrollPosition, 
  removeCurrentPathFromHistory,
  saveScrollPosition,
  recordNavigation
} from "@/utils/scrollRestoration";

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
    title: "Main",
    items: [
      { name: "Home", path: "/", icon: Home },
      { name: "Videos", path: "/videos", icon: PlayCircle },
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
      { name: "Favorites", path: "/videos?filter=favorites", icon: Heart },
      { name: "Watch Later", path: "/videos?filter=watchlater", icon: Clock },
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
  userId?: string;
}

export const Sidebar = ({ isAuthenticated = false, userId }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const [isExpanded, setIsExpanded] = useState(!isHomePage);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { allCategories } = useCategories();

  // Fetch user subscriptions
  const { data: subscriptions } = useQuery({
    queryKey: ["sidebar-subscriptions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("channel_subscriptions")
        .select(`
          channel:youtube_channels!inner (
            channel_id,
            title,
            thumbnail_url
          )
        `)
        .eq("user_id", userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && isAuthenticated,
  });

  // Update expanded state when route changes
  useEffect(() => {
    if (isHomePage) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isHomePage]);

  // Record navigation for back button
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    recordNavigation(currentPath);
  }, [location.pathname, location.search]);

  // Don't render on homepage
  if (isHomePage) return null;

  const isActive = (path: string) => {
    const [basePath, query] = path.split("?");
    if (query) {
      return location.pathname === basePath && location.search.includes(query.split("=")[1]);
    }
    return location.pathname === basePath;
  };

  const canGoBack = () => {
    return !!getPreviousPath();
  };

  const handleGoBack = () => {
    saveScrollPosition(location.pathname + location.search);
    const previousPath = getPreviousPath();
    
    if (previousPath) {
      removeCurrentPathFromHistory();
      const scrollPosition = getScrollPosition(previousPath);
      navigate(previousPath);
      
      setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: 'auto' });
      }, 50);
    } else {
      navigate("/?skipWelcome=true");
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/videos?category=${categoryId}`);
    setIsCategoriesOpen(false);
  };

  const sidebarWidth = isExpanded ? 200 : 64;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed top-0 left-0 bottom-0 z-40 bg-white flex flex-col overflow-hidden border-r border-gray-100"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center border-b border-gray-100 h-14",
        isExpanded ? "px-4 justify-between" : "px-2 justify-center"
      )}>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img 
            src={yidvidLogoIcon} 
            alt="YidVid" 
            className="w-8 h-8 object-contain"
          />
          {isExpanded && (
            <span 
              className="text-base font-bold text-gray-800"
              style={{ fontFamily: "'Fredoka One', 'Nunito', sans-serif" }}
            >
              YidVid
            </span>
          )}
        </Link>
        
        {/* Toggle Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 rounded-full hover:bg-gray-100"
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </Button>
      </div>

      {/* Back Button - Only show when can go back and on detail pages (not main listing pages) */}
      {canGoBack() && (location.pathname.startsWith("/video/") || location.pathname.startsWith("/channel/")) && (
        <div className={cn("px-2 py-2 border-b border-gray-50", isExpanded ? "px-3" : "")}>
          <button
            onClick={handleGoBack}
            title="Go back"
            className={cn(
              "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
              "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
              isExpanded ? "gap-2 px-3 py-2 w-full" : "justify-center p-2 w-10 h-10 mx-auto"
            )}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {isExpanded && <span>Back</span>}
          </button>
        </div>
      )}

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navSections.map((section, sectionIdx) => {
          if (section.requiresAuth && !isAuthenticated) return null;
          
          return (
            <div key={sectionIdx} className={sectionIdx > 0 ? "mt-3 pt-3 border-t border-gray-100" : ""}>
              {section.title && isExpanded && (
                <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.path + item.name}
                      to={item.path}
                      title={!isExpanded ? item.name : undefined}
                      className={cn(
                        "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                        isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5",
                        active
                          ? 'bg-transparent border-2 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-2 border-transparent'
                      )}
                      style={{
                        borderColor: active ? 'hsl(0, 70%, 55%)' : undefined,
                      }}
                    >
                      <Icon className={cn(
                        "w-5 h-5 shrink-0",
                        active ? 'text-[hsl(0,70%,55%)]' : 'text-gray-500'
                      )} />
                      {isExpanded && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Categories Section */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {isExpanded && (
            <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Categories
            </div>
          )}
          
          <button
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            title={!isExpanded ? "Categories" : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm font-medium transition-all duration-200 w-full",
              isExpanded ? "gap-3 px-3 py-2.5 justify-between" : "justify-center p-2.5",
              "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 shrink-0 text-gray-500" />
              {isExpanded && <span>Browse Categories</span>}
            </div>
            {isExpanded && (
              isCategoriesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {isCategoriesOpen && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-4"
              >
                {allCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-all",
                      selectedCategory === category.id
                        ? "bg-red-50 text-red-600"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subscriptions Section - Only for authenticated users */}
        {isAuthenticated && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {isExpanded && (
              <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Subscriptions
              </div>
            )}
            
            <button
              onClick={() => setIsSubscriptionsOpen(!isSubscriptionsOpen)}
              title={!isExpanded ? "Subscriptions" : undefined}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all duration-200 w-full",
                isExpanded ? "gap-3 px-3 py-2.5 justify-between" : "justify-center p-2.5",
                "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 shrink-0 text-gray-500" />
                {isExpanded && <span>Subscriptions</span>}
              </div>
              {isExpanded && (
                isSubscriptionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {isSubscriptionsOpen && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden ml-2"
                >
                  {subscriptions && subscriptions.length > 0 ? (
                    subscriptions.map((sub: any) => (
                      <Link
                        key={sub.channel.channel_id}
                        to={`/channel/${sub.channel.channel_id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        <img
                          src={sub.channel.thumbnail_url || '/placeholder.svg'}
                          alt={sub.channel.title}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="truncate text-xs">{sub.channel.title}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      No subscriptions yet
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>
    </motion.aside>
  );
};

// Export sidebar width for use in other components
export const SIDEBAR_EXPANDED_WIDTH = 200;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
