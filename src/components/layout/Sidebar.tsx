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
    items: [
      { name: "Home", path: "/", icon: Home },
      { name: "Videos", path: "/videos", icon: PlayCircle },
      { name: "New Videos", path: "/videos?sort=newest", icon: Sparkles },
    ]
  },
  {
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

// Shared nav item styles
const getNavItemClass = (isExpanded: boolean, active: boolean) =>
  cn(
    "flex items-center text-sm font-medium transition-all duration-200",
    isExpanded
      ? "gap-3 px-3 py-2.5 rounded-full"
      : "justify-center p-2 rounded-full mx-auto w-10 h-10",
    active
      ? "bg-[#F5F5F5] border-l-[3px] border-[#FF0000] text-[#FF0000]"
      : "border border-transparent hover:bg-[#F0F0F0] text-[#666666] hover:text-[#1A1A1A]"
  );

const getIconClass = (active: boolean) =>
  cn("w-5 h-5 shrink-0 transition-colors", active ? "text-[#FF0000]" : "text-[#666666]");

const getLabelClass = (active: boolean) =>
  cn("truncate transition-colors", active ? "text-[#FF0000]" : "text-[#1A1A1A]");

export const Sidebar = ({ isAuthenticated = false, userId }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const { isExpanded, setIsExpanded } = useSidebarContext();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  
  const { allCategories } = useCategories();

  const searchParams = new URLSearchParams(location.search);
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "all");

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      setIsCategoriesOpen(true);
    } else if (location.pathname === "/videos" && !location.search.includes("category=")) {
      setSelectedCategory("all");
    }
  }, [categoryFromUrl, location.pathname, location.search]);

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

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    recordNavigation(currentPath);
  }, [location.pathname, location.search]);

  const effectiveIsExpanded = isHomePage ? false : isExpanded;

  const isViewingCategory = location.pathname === "/videos" && categoryFromUrl && categoryFromUrl !== "all";

  const isActive = (path: string) => {
    const [basePath, query] = path.split("?");
    if (isViewingCategory && path === "/videos") return false;
    if (query) {
      return location.pathname === basePath && location.search.includes(query.split("=")[1]);
    }
    if (basePath === "/videos" && location.pathname === "/videos") {
      return !location.search.includes("sort=") && !location.search.includes("category=");
    }
    return location.pathname === basePath;
  };

  const isCategoryActive = (categoryId: string) => {
    return location.pathname === "/videos" && categoryFromUrl === categoryId;
  };

  const canGoBack = () => !!getPreviousPath();

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
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-[#E5E5E5] h-14",
        effectiveIsExpanded ? "px-4 justify-between" : "px-2 justify-center"
      )}>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={yidvidLogoIcon} alt="YidVid" className="w-8 h-8 rounded-full object-contain" />
          {effectiveIsExpanded && (
            <span className="text-base font-bold text-[#1A1A1A]" style={{ fontFamily: "'Fredoka One', 'Nunito', sans-serif" }}>
              YidVid
            </span>
          )}
        </Link>
        
        {!isHomePage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 rounded-full hover:bg-[#F0F0F0] text-[#666666]"
          >
            {effectiveIsExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Back Button */}
      {canGoBack() && (location.pathname.startsWith("/video/") || location.pathname.startsWith("/channel/")) && (
        <div className={cn("px-2 py-2 border-b border-[#E5E5E5]", effectiveIsExpanded ? "px-3" : "")}>
          <button
            onClick={handleGoBack}
            title="Go back"
            className={cn(
              "flex items-center rounded-full text-sm font-medium transition-all duration-200",
              "text-[#666666] hover:bg-[#F0F0F0] hover:text-[#1A1A1A]",
              effectiveIsExpanded ? "gap-2 px-3 py-2.5 w-full" : "justify-center p-2 w-10 h-10 mx-auto"
            )}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {effectiveIsExpanded && <span>Back</span>}
          </button>
        </div>
      )}

      {/* Scrollable Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {/* Main Nav */}
        <div className="space-y-1">
          {navSections[0].items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path + item.name}
                to={item.path}
                title={!effectiveIsExpanded ? item.name : undefined}
                className={getNavItemClass(effectiveIsExpanded, active)}
              >
                <Icon className={getIconClass(active)} />
                {effectiveIsExpanded && <span className={getLabelClass(active)}>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Categories */}
        <div className="mt-2 pt-2 border-t border-[#E5E5E5]">
          <button
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            title={!effectiveIsExpanded ? "Categories" : undefined}
            className={cn(
              "flex items-center text-sm font-medium transition-all duration-200 w-full",
              effectiveIsExpanded
                ? "gap-3 px-3 py-2.5 rounded-full justify-between"
                : "justify-center p-2 rounded-full mx-auto w-10 h-10",
              "border border-transparent hover:bg-[#F0F0F0] text-[#666666] hover:text-[#1A1A1A]"
            )}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 shrink-0" />
              {effectiveIsExpanded && <span className="text-[#1A1A1A]">Categories</span>}
            </div>
            {effectiveIsExpanded && (
              isCategoriesOpen
                ? <ChevronUp className="w-4 h-4 text-[#999999]" />
                : <ChevronDown className="w-4 h-4 text-[#999999]" />
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
                    const isUrl = category.icon?.startsWith('http') || category.icon?.startsWith('/');
                    return !isUrl;
                  })
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 my-0.5",
                        isCategoryActive(category.id)
                          ? "bg-[#F5F5F5] border-l-[3px] border-[#FF0000] text-[#FF0000]"
                          : "text-[#1A1A1A] hover:bg-[#F0F0F0] border border-transparent"
                      )}
                    >
                      {category.label}
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Library */}
        <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
          {effectiveIsExpanded && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-[#999999] uppercase tracking-wider">
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
                  className={getNavItemClass(effectiveIsExpanded, active)}
                >
                  <Icon className={getIconClass(active)} />
                  {effectiveIsExpanded && <span className={getLabelClass(active)}>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings & About */}
        {navSections.slice(1).map((section, sectionIdx) => (
          <div key={sectionIdx} className="mt-3 pt-3 border-t border-[#E5E5E5]">
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path + item.name}
                    to={item.path}
                    title={!effectiveIsExpanded ? item.name : undefined}
                    className={getNavItemClass(effectiveIsExpanded, active)}
                  >
                    <Icon className={getIconClass(active)} />
                    {effectiveIsExpanded && <span className={getLabelClass(active)}>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Subscriptions */}
        <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
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
                ? "gap-3 px-3 py-2.5 rounded-full justify-between"
                : "justify-center p-2 rounded-full mx-auto w-10 h-10",
              "border border-transparent hover:bg-[#F0F0F0] text-[#666666] hover:text-[#1A1A1A]"
            )}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 shrink-0" />
              {effectiveIsExpanded && <span className="text-[#1A1A1A]">Subscriptions</span>}
            </div>
            {effectiveIsExpanded && (
              isSubscriptionsOpen
                ? <ChevronUp className="w-4 h-4 text-[#999999]" />
                : <ChevronDown className="w-4 h-4 text-[#999999]" />
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
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-full text-[#666666] hover:bg-[#F0F0F0] hover:text-[#1A1A1A] border border-transparent transition-all duration-200 my-0.5"
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
                  <div className="px-3 py-2 text-xs text-[#999999]">
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

export { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/contexts/SidebarContext";
