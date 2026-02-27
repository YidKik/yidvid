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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Bell,
  ArrowLeft,
  LogIn,
  ListMusic,
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
import { toast } from "sonner";
import { useSidebarContext } from "@/contexts/SidebarContext";

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
    // No title - these are the main nav items
    items: [
      { name: "Home", path: "/", icon: Home },
      { name: "Videos", path: "/videos", icon: PlayCircle },
      { name: "New Videos", path: "/videos?sort=newest", icon: Sparkles },
    ]
  },
  {
    // Settings section without title
    items: [
      { name: "Settings", path: "/settings", icon: Settings },
      { name: "About", path: "/about", icon: Info },
    ]
  }
];

const librarySection: NavSection = {
  title: "Library",
  requiresAuth: true,
  items: [
    { name: "History", path: "/dashboard", icon: History },
    { name: "Favorites", path: "/favorites", icon: Heart },
    { name: "Watch Later", path: "/watch-later", icon: Clock },
    { name: "Playlists", path: "/playlists", icon: ListMusic },
  ]
};

interface SidebarProps {
  isAuthenticated?: boolean;
  userId?: string;
}

export const Sidebar = ({ isAuthenticated = false, userId }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const { isExpanded, setIsExpanded } = useSidebarContext();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  
  const { allCategories } = useCategories();

  // Get category from URL params
  const searchParams = new URLSearchParams(location.search);
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "all");

  // Sync selected category with URL
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      setIsCategoriesOpen(true); // Auto-open categories dropdown when a category is selected
    } else if (location.pathname === "/videos" && !location.search.includes("category=")) {
      setSelectedCategory("all");
    }
  }, [categoryFromUrl, location.pathname, location.search]);

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

  // Record navigation for back button
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    recordNavigation(currentPath);
  }, [location.pathname, location.search]);

  // On homepage, show collapsed sidebar
  const effectiveIsExpanded = isHomePage ? false : isExpanded;

  // Check if viewing a specific category
  const isViewingCategory = location.pathname === "/videos" && categoryFromUrl && categoryFromUrl !== "all";

  const isActive = (path: string) => {
    const [basePath, query] = path.split("?");
    
    // If we're viewing a category, don't highlight the Videos page
    if (isViewingCategory && path === "/videos") {
      return false;
    }
    
    if (query) {
      // For paths with query params (like /videos?sort=newest), check exact match
      return location.pathname === basePath && location.search.includes(query.split("=")[1]);
    }
    
    // For paths without query params (like /videos), only match if there's no conflicting query
    // This prevents /videos from being active when on /videos?sort=newest or /videos?category=xxx
    if (basePath === "/videos" && location.pathname === "/videos") {
      // Only active if there's no sort param or category param in the URL
      return !location.search.includes("sort=") && !location.search.includes("category=");
    }
    
    return location.pathname === basePath;
  };

  // Check if a specific category is active
  const isCategoryActive = (categoryId: string) => {
    return location.pathname === "/videos" && categoryFromUrl === categoryId;
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

  const sidebarWidth = effectiveIsExpanded ? 200 : 64;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed top-0 left-0 bottom-0 z-40 bg-white flex flex-col overflow-hidden border-r border-[#E5E5E5]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center border-b border-[#E5E5E5] h-14",
        effectiveIsExpanded ? "px-4 justify-between" : "px-2 justify-center"
      )}>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img 
            src={yidvidLogoIcon} 
            alt="YidVid" 
            className="w-8 h-8 object-contain"
          />
          {effectiveIsExpanded && (
            <span 
              className="text-base font-bold text-gray-800"
              style={{ fontFamily: "'Fredoka One', 'Nunito', sans-serif" }}
            >
              YidVid
            </span>
          )}
        </Link>
        
        {/* Toggle Arrow - hidden on homepage */}
        {!isHomePage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 rounded-full hover:bg-[#F0F0F0]"
          >
            {effectiveIsExpanded ? (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </Button>
        )}
      </div>

      {/* Back Button - Only show when can go back and on detail pages (not main listing pages) */}
      {canGoBack() && (location.pathname.startsWith("/video/") || location.pathname.startsWith("/channel/")) && (
        <div className={cn("px-2 py-2 border-b border-[#E5E5E5]", effectiveIsExpanded ? "px-3" : "")}>
          <button
            onClick={handleGoBack}
            title="Go back"
            className={cn(
              "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
              "text-gray-500 hover:bg-[#F0F0F0] hover:text-gray-700",
              effectiveIsExpanded ? "gap-2 px-3 py-2 w-full" : "justify-center p-2 w-10 h-10 mx-auto"
            )}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {effectiveIsExpanded && <span>Back</span>}
          </button>
        </div>
      )}

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {/* Main Nav Section */}
        {navSections.slice(0, 1).map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path + item.name}
                    to={item.path}
                    title={!effectiveIsExpanded ? item.name : undefined}
                    className={cn(
                      "flex items-center text-sm font-medium transition-all duration-200",
                      effectiveIsExpanded 
                        ? "gap-3 px-3 py-2 rounded-full" 
                        : "justify-center p-2 rounded-full mx-auto w-10 h-10",
                      active
                        ? 'bg-white border-l-[3px] border-[#FF0000] text-[#FF0000]'
                        : 'border border-transparent hover:bg-[#F0F0F0]'
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      active ? 'text-[#FF0000]' : 'text-gray-600'
                    )} />
                    {effectiveIsExpanded && (
                      <span className={cn(
                        "truncate transition-colors",
                        active ? 'text-[#FF0000]' : 'text-gray-700'
                      )}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Categories Section - Moved up right after main nav */}
        <div className="mt-2 pt-2 border-t border-[#E5E5E5]">
          <button
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            title={!effectiveIsExpanded ? "Categories" : undefined}
            className={cn(
              "flex items-center text-sm font-medium transition-all duration-200 w-full",
              effectiveIsExpanded 
                ? "gap-3 px-3 py-2 rounded-full justify-between" 
                : "justify-center p-2 rounded-full mx-auto w-10 h-10",
              "border border-transparent hover:bg-[#F0F0F0] text-gray-700"
            )}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 shrink-0 text-gray-600" />
              {effectiveIsExpanded && <span>Categories</span>}
            </div>
            {effectiveIsExpanded && (
              isCategoriesOpen 
                ? <ChevronUp className="w-4 h-4 text-gray-500" /> 
                : <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {isCategoriesOpen && effectiveIsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-2 mr-1 py-1"
              >
                {allCategories
                  .filter((category) => {
                    // Only show categories with emoji icons (not URLs)
                    const isUrl = category.icon?.startsWith('http') || category.icon?.startsWith('/');
                    return !isUrl;
                  })
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={cn(
                        "flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg transition-all duration-200 my-0.5",
                        "hover:scale-[1.01]",
                        isCategoryActive(category.id)
                          ? "bg-white text-[#FF0000] border-l-[3px] border-[#FF0000]"
                          : "text-gray-600 hover:bg-[#F0F0F0] hover:text-[#1A1A1A] border border-transparent"
                      )}
                    >
                      <span className={cn(
                        "text-base transition-all duration-200",
                        isCategoryActive(category.id) ? "opacity-100" : "opacity-60"
                      )}>{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Library Section */}
        <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
          {effectiveIsExpanded && (
            <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {librarySection.title}
            </div>
          )}
          
          <div className="space-y-1">
            {librarySection.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              const handleItemClick = (e: React.MouseEvent) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  toast.info("Please sign in to access this feature", {
                    icon: <LogIn className="w-4 h-4" />,
                  });
                }
              };
              
              return (
                <Link
                  key={item.path + item.name}
                  to={isAuthenticated ? item.path : "#"}
                  onClick={handleItemClick}
                  title={!effectiveIsExpanded ? item.name : undefined}
                  className={cn(
                    "flex items-center text-sm font-medium transition-all duration-200",
                    effectiveIsExpanded 
                      ? "gap-3 px-3 py-2 rounded-full" 
                      : "justify-center p-2 rounded-full mx-auto w-10 h-10",
                    active
                      ? 'border border-red-400 bg-red-50/50'
                      : 'border border-transparent hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    active ? 'text-[#FF0000]' : 'text-gray-600'
                  )} />
                  {effectiveIsExpanded && (
                    <span className={cn(
                      "truncate transition-colors",
                        active ? 'text-[#FF0000]' : 'text-gray-700'
                    )}>
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings Section */}
        {navSections.slice(1).map((section, sectionIdx) => (
          <div key={sectionIdx} className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path + item.name}
                    to={item.path}
                    title={!effectiveIsExpanded ? item.name : undefined}
                    className={cn(
                      "flex items-center text-sm font-medium transition-all duration-200",
                      effectiveIsExpanded 
                        ? "gap-3 px-3 py-2 rounded-full" 
                        : "justify-center p-2 rounded-full mx-auto w-10 h-10",
                      active
                        ? 'border border-red-400 bg-red-50/50'
                        : 'border border-transparent hover:bg-gray-50'
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      active ? 'text-red-500' : 'text-gray-600'
                    )} />
                    {effectiveIsExpanded && (
                      <span className={cn(
                        "truncate transition-colors",
                        active ? 'text-red-500' : 'text-gray-700'
                      )}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Subscriptions Section */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast.info("Please sign in to view your subscriptions", {
                  icon: <LogIn className="w-4 h-4" />,
                });
                return;
              }
              setIsSubscriptionsOpen(!isSubscriptionsOpen);
            }}
            title={!effectiveIsExpanded ? "Subscriptions" : undefined}
            className={cn(
              "flex items-center text-sm font-medium transition-all duration-200 w-full",
              effectiveIsExpanded 
                ? "gap-3 px-3 py-2 rounded-full justify-between" 
                : "justify-center p-2 rounded-full mx-auto w-10 h-10",
              "border border-transparent hover:bg-gray-50 text-gray-700"
            )}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 shrink-0 text-gray-600" />
              {effectiveIsExpanded && <span>Subscriptions</span>}
            </div>
            {effectiveIsExpanded && (
              isSubscriptionsOpen 
                ? <ChevronUp className="w-4 h-4 text-gray-500" /> 
                : <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {isSubscriptionsOpen && effectiveIsExpanded && isAuthenticated && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-2 mr-1 py-1"
              >
                {subscriptions && subscriptions.length > 0 ? (
                  subscriptions.map((sub: any) => (
                    <Link
                      key={sub.channel.channel_id}
                      to={`/channel/${sub.channel.channel_id}`}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-lg text-gray-600 hover:bg-yellow-50 hover:text-yellow-700 border border-transparent transition-all duration-200 hover:scale-[1.01] my-0.5"
                    >
                      <img
                        src={sub.channel.thumbnail_url || '/placeholder.svg'}
                        alt={sub.channel.title}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="truncate text-xs font-medium">{sub.channel.title}</span>
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
      </nav>
    </motion.aside>
  );
};

// Re-export sidebar width constants from context for backward compatibility
export { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/contexts/SidebarContext";
