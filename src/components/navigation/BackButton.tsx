
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

// We'll store scroll positions for each path in sessionStorage
const saveScrollPosition = (path: string) => {
  try {
    const scrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
    scrollPositions[path] = window.scrollY;
    sessionStorage.setItem('scrollPositions', JSON.stringify(scrollPositions));
  } catch (e) {
    console.warn('Could not save scroll position:', e);
  }
};

// Retrieve previously saved scroll position for a path
const getScrollPosition = (path: string): number => {
  try {
    const scrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
    return scrollPositions[path] || 0;
  } catch (e) {
    console.warn('Could not retrieve scroll position:', e);
    return 0;
  }
};

export const BackButton = ({ className }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Track navigation history in session storage
  useEffect(() => {
    // Save current path to history when visiting a new page
    const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    // Only add to history if this is a new page visit (not a back navigation)
    if (history.length === 0 || history[history.length - 1] !== location.pathname) {
      history.push(location.pathname);
      sessionStorage.setItem('navigationHistory', JSON.stringify(history));
    }
    
    // Also save current scroll position for this path
    saveScrollPosition(location.pathname);
    
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Only show button when very close to the top (within 100px) or at the top
      if (currentScrollY <= 100) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY && currentScrollY <= 250) {
        // When scrolling up, only show if we're within 250px of the top
        setVisible(true);
      } else {
        setVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Clean up event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleGoBack = () => {
    // Get navigation history
    const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    if (history.length > 1) {
      // Remove current page from history
      history.pop();
      
      // Get the previous page
      const previousPath = history[history.length - 1];
      
      // Update history in storage (remove current page)
      sessionStorage.setItem('navigationHistory', JSON.stringify(history));
      
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
      // If no history, go to home
      navigate("/?skipWelcome=true");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleGoBack}
      className={cn(
        "fixed top-12 left-4 p-2 hover:bg-primary/5 transition-all duration-200", // Adjusted position higher
        "rounded-full shadow-sm hover:shadow-md",
        "border border-gray-100 bg-white/95 backdrop-blur-sm",
        "group hover:scale-105 active:scale-95",
        "z-[100]", // Ensure it's above other elements
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 text-black group-hover:h-5 group-hover:w-5 transition-all duration-200" />
    </Button>
  );
};
