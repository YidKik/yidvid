
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className }: BackButtonProps) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate("/?skipWelcome=true")}
      className={cn(
        "fixed top-16 left-4 p-2 hover:bg-primary/5 transition-all duration-200",
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
