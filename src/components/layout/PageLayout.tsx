import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className }: PageLayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  // On homepage, no sidebar offset needed
  // On other pages, add padding for the expanded sidebar (200px default)
  return (
    <div 
      className={cn(
        "min-h-screen pt-14 transition-all duration-300",
        !isHomePage && "pl-[200px]",
        className
      )}
    >
      {children}
    </div>
  );
};
