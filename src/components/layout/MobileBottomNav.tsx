import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PlayCircle, Library, Settings, Info, History, Heart, Clock, ListMusic, LogIn, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MobileBottomNavProps {
  isAuthenticated?: boolean;
}

export const MobileBottomNav = ({ isAuthenticated = false }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLibrary, setShowLibrary] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/videos") return location.pathname === "/videos";
    if (path === "/settings") return location.pathname === "/settings";
    if (path === "/about") return location.pathname === "/about";
    return false;
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: PlayCircle, label: "Videos", path: "/videos" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Library, label: "Library", action: "library" as const },
    { icon: Info, label: "Info", path: "/about" },
  ];

  const libraryItems = [
    { icon: History, label: "History", path: "/history" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: Clock, label: "Watch Later", path: "/watch-later" },
    { icon: ListMusic, label: "Playlists", path: "/playlists" },
    { icon: Users, label: "Subscriptions", path: "/subscriptions" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if ('action' in item && item.action === "library") {
      setShowLibrary(!showLibrary);
    } else if ('path' in item) {
      setShowLibrary(false);
      navigate(item.path);
    }
  };

  const handleSheetItemClick = (path: string, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      toast.info("Please sign in to access this feature", { icon: <LogIn className="w-4 h-4" /> });
      return;
    }
    setShowLibrary(false);
    navigate(path);
  };

  const isLibraryActive = ["/history", "/favorites", "/watch-later", "/playlists", "/subscriptions"].includes(location.pathname);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowLibrary(false)}
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
              <div className="grid grid-cols-3 gap-2 pb-2">
                {libraryItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSheetItemClick(item.path, true)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all",
                        active ? "bg-[#FFF0F0] dark:bg-[#3a2020] text-[#FF0000]" : "bg-[#F5F5F5] dark:bg-[#2a2a2a] text-[#666666] dark:text-[#aaa] hover:bg-[#EFEFEF] dark:hover:bg-[#333]",
                        !isAuthenticated && "opacity-40"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", active ? "text-[#FF0000]" : "text-[#888] dark:text-[#999]")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
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
