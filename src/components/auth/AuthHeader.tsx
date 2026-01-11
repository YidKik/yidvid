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
    <div 
      className="flex flex-col px-5 py-4 bg-yellow-50 border-b border-yellow-200 relative"
      style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
      
      <div className="flex items-center">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2 h-8 w-8 rounded-full transition-all duration-200 hover:bg-yellow-100 border border-yellow-300"
          >
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </Button>
        )}
        {!onBack && <div className="h-8" />}
      </div>
      
      <div className="text-center mt-1">
        {title && (
          <h3 
            className="text-xl font-bold text-gray-800"
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p 
            className="text-sm text-gray-600 mt-1 font-medium"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
