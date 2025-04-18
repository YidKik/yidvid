
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  getPreviousPath, 
  getScrollPosition, 
  removeCurrentPathFromHistory,
  saveScrollPosition
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
    // Save current scroll position before navigating
    saveScrollPosition(location.pathname + location.search);
    
    // Get previous path from history
    const previousPath = getPreviousPath();
    
    if (previousPath) {
      // Remove current page from history
      removeCurrentPathFromHistory();
      
      // Get saved scroll position for the previous page
      const scrollPosition = getScrollPosition(previousPath);
      
      // Navigate to previous page
      navigate(previousPath);
      
      // After navigation, restore scroll position with a slight delay to ensure page is loaded
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'auto'
        });
      }, 100);
    } else {
      // If no history, go to home but skip welcome
      navigate("/?skipWelcome=true");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleGoBack}
      className={cn(
        "fixed top-12 left-4 p-2 hover:bg-primary/5 transition-all duration-200",
        "rounded-full shadow-sm hover:shadow-md",
        "border border-gray-100 bg-white/95 backdrop-blur-sm",
        "group hover:scale-105 active:scale-95",
        "z-[100]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 text-black group-hover:h-5 group-hover:w-5 transition-all duration-200" />
    </Button>
  );
};
