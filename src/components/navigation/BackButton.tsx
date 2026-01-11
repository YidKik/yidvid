
import { useState, useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  getPreviousPath, 
  getScrollPosition, 
  removeCurrentPathFromHistory,
  saveScrollPosition,
  recordNavigation
} from "@/utils/scrollRestoration";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isVideosPage = location.pathname.startsWith("/videos");
  const isSearchPage = location.pathname.startsWith("/search");
  
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    recordNavigation(currentPath);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show when at top or when scrolling up
      if (currentScrollY <= 100) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Show whenever scrolling up, regardless of distance
        setVisible(true);
      } else {
        setVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleGoBack = () => {
    saveScrollPosition(location.pathname + location.search);
    
    const previousPath = getPreviousPath();
    
    console.log("Back button clicked. Previous path:", previousPath);
    
    if (previousPath) {
      removeCurrentPathFromHistory();
      
      const scrollPosition = getScrollPosition(previousPath);
      
      navigate(previousPath);
      
      // Use multiple restoration attempts for more reliable scroll restoration
      const restoreScroll = () => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'auto'
        });
        console.log(`Restored scroll position to: ${scrollPosition}px for path: ${previousPath}`);
      };
      
      // Immediate attempt
      setTimeout(restoreScroll, 50);
      
      // Follow-up attempts to ensure restoration works
      setTimeout(restoreScroll, 200);
      setTimeout(restoreScroll, 500);
      
      // Final attempt after page is fully loaded
      setTimeout(() => {
        if (Math.abs(window.scrollY - scrollPosition) > 10) {
          restoreScroll();
        }
      }, 1000);
    } else {
      console.log("No previous path found, navigating to home with skipWelcome");
      navigate("/?skipWelcome=true");
    }
  };

  const handleGoHome = () => {
    saveScrollPosition(location.pathname + location.search);
    navigate("/videos");
  };

  return (
    <button
      onClick={handleGoBack}
      className={cn(
        "fixed left-4 z-[100] flex items-center gap-2 px-3 py-2 rounded-full",
        "top-[72px] md:top-16",
        "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md",
        "border border-gray-200/50 dark:border-gray-700/50",
        "text-muted-foreground hover:text-foreground",
        "shadow-sm hover:shadow-md",
        "transition-all duration-300 ease-in-out",
        "hover:bg-white/80 dark:hover:bg-gray-900/80",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
        className
      )}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-sm font-medium hidden sm:inline">Back</span>
    </button>
  );
};
