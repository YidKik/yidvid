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
      className="flex flex-col px-8 pt-6 pb-5 bg-muted border-b border-[#EEEEEE] relative"
      style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-brand to-brand" />
      
      <div className="flex items-center mb-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 rounded-xl transition-all duration-200 hover:bg-[#EEEEEE] border border-border"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Button>
        )}
        {!onBack && <div className="h-9" />}
      </div>
      
      <div className="text-center">
        {title && (
          <h3 
            className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p 
            className="text-sm text-muted-foreground mt-1.5 font-medium"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
