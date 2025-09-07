
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
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
  
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    recordNavigation(currentPath);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 100) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY && currentScrollY <= 250) {
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

  return (
    <button
      onClick={handleGoBack}
      className={cn(
        "bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-full", // Updated to use theme colors
        "fixed top-12 left-4 transition-all duration-200",
        "group hover:scale-105 active:scale-95",
        "z-[100]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
};
