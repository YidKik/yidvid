
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface AuthHeaderProps {
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthHeader = ({ onBack, title, subtitle }: AuthHeaderProps) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className={`flex flex-col ${isMobile ? 'px-4 py-3' : 'px-8 py-6'} bg-transparent border-b border-primary/30 relative after:content-[""] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:shadow-[0_0_5px_1px_rgba(234,56,76,0.7)] after:animate-pulse-slow`}>
      <div className="flex items-center">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2 h-8 w-8 rounded-full transition-all duration-300 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Button>
        )}
        {!onBack && <div className="h-8" />}
      </div>
      
      <div className="text-center mt-3">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 animate-[fadeIn_0.4s_ease-out_forwards] opacity-0">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1 animate-[fadeIn_0.5s_ease-out_0.1s_forwards] opacity-0">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
