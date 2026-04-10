import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PlayCircle, Search, Library, Menu, X, History, Heart, Clock, ListMusic, Settings, Info, Bell, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

interface MobileBottomNavProps {
  isAuthenticated?: boolean;
}

export const MobileBottomNav = ({ isAuthenticated = false }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthOpen } = useSessionManager();
  const [showLibrary, setShowLibrary] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { allCategories } = useCategories();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/videos") return location.pathname === "/videos";
    if (path === "/search") return location.pathname === "/search";
    return false;
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: PlayCircle, label: "Videos", path: "/videos" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Library", action: "library" as const },
    { icon: Menu, label: "Menu", action: "menu" as const },
  ];

  const libraryItems = [
    { icon: History, label: "History", path: "/history" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: Clock, label: "Watch Later", path: "/watch-later" },
    { icon: ListMusic, label: "Playlists", path: "/playlists" },
  ];

  const menuItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Info, label: "About", path: "/about" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if ('action' in item && item.action === "library") {
      setShowMenu(false);
      setShowLibrary(!showLibrary);
    } else if ('action' in item && item.action === "menu") {
      setShowLibrary(false);
      setShowMenu(!showMenu);
    } else if ('path' in item) {
      setShowLibrary(false);
      setShowMenu(false);
      navigate(item.path);
    }
  };

  const handleSheetItemClick = (path: string, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      toast.info("Please sign in to access this feature", { icon: <LogIn className="w-4 h-4" /> });
      return;
    }
    setShowLibrary(false);
    setShowMenu(false);
    navigate(path);
  };

  const isLibraryActive = ["/history", "/favorites", "/watch-later", "/playlists"].includes(location.pathname);
  const isMenuActive = ["/settings", "/about"].includes(location.pathname);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {(showLibrary || showMenu) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => { setShowLibrary(false); setShowMenu(false); }}
          />
        )}
      </AnimatePresence>

      {/* Library Sheet */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-14 left-0 right-0 z-40 bg-white dark:bg-[#212121] rounded-t-2xl border-t border-[#E5E5E5] dark:border-[#333] shadow-2xl"
          >
            <div className="w-12 h-1 bg-[#E5E5E5] dark:bg-[#555] rounded-full mx-auto mt-3" />
            <div className="p-4 pb-2">
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#e8e8e8] mb-3 px-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Library</h3>
              <div className="space-y-1">
                {libraryItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSheetItemClick(item.path, true)}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all",
                        active ? "bg-[#F5F5F5] dark:bg-[#333] text-[#FF0000]" : "text-[#666666] dark:text-[#aaa] hover:bg-[#F5F5F5] dark:hover:bg-[#333]",
                        !isAuthenticated && "opacity-40"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", active ? "text-[#FF0000]" : "text-[#666666]")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Sheet */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-14 left-0 right-0 z-40 bg-white dark:bg-[#212121] rounded-t-2xl border-t border-[#E5E5E5] dark:border-[#333] shadow-2xl max-h-[60vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-[#E5E5E5] dark:bg-[#555] rounded-full mx-auto mt-3 sticky top-0" />
            <div className="p-4 pb-2">
              {/* Menu items */}
              <div className="space-y-1 mb-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSheetItemClick(item.path)}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all",
                        active ? "bg-[#F5F5F5] dark:bg-[#333] text-[#FF0000]" : "text-[#666666] dark:text-[#aaa] hover:bg-[#F5F5F5] dark:hover:bg-[#333]"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", active ? "text-[#FF0000]" : "text-[#666666]")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Categories */}
              {allCategories.length > 0 && (
                <div className="border-t border-[#E5E5E5] dark:border-[#333] pt-3">
                  <h3 className="text-xs font-bold text-[#999999] dark:text-[#717171] uppercase tracking-wider mb-2 px-1">Categories</h3>
                  <div className="space-y-1">
                    {allCategories
                      .filter((c) => {
                        const isUrl = c.icon?.startsWith('http') || c.icon?.startsWith('/');
                        return !isUrl;
                      })
                      .map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleSheetItemClick(`/videos?category=${category.id}`)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#666666] dark:text-[#aaa] hover:bg-[#F5F5F5] dark:hover:bg-[#333] transition-all"
                        >
                          <span>{category.label}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Sign In */}
              {!isAuthenticated && (
                <div className="border-t border-[#E5E5E5] dark:border-[#333] pt-3 mt-3">
                  <button
                    onClick={() => { setShowMenu(false); setIsAuthOpen(true); }}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold text-[#FF0000] hover:bg-[#F5F5F5] dark:hover:bg-[#333] transition-all"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#212121] border-t border-[#E5E5E5] dark:border-[#333] shadow-lg lg:hidden" style={{ fontFamily: "'Quicksand', sans-serif" }}>
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = 'path' in item ? isActive(item.path) 
              : item.action === 'library' ? (isLibraryActive || showLibrary)
              : item.action === 'menu' ? (isMenuActive || showMenu)
              : false;
            
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="flex flex-col items-center justify-center h-full px-3 min-w-0"
              >
                <Icon className={cn("w-5 h-5 mb-0.5 transition-colors", active ? "text-[#FF0000]" : "text-[#666666] dark:text-[#aaa]")} />
                <span className={cn("text-[10px] font-semibold transition-colors", active ? "text-[#FF0000]" : "text-[#666666] dark:text-[#aaa]")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
