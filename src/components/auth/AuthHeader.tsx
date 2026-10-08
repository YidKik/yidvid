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
      className="flex flex-col px-4 sm:px-6 pt-6 pb-4 bg-muted border-b border-border relative"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-brand to-brand" />
      
      <div className="flex items-center mb-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Back"
            className="h-11 w-11 rounded-control transition-all duration-200 hover:bg-surface-active border border-border"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Button>
        )}
        {!onBack && <div className="h-11" />}
      </div>
      
      <div className="text-center">
        {title && (
          <h2
            className="type-h2 text-foreground"
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p 
            className="type-label text-muted-foreground mt-1"
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
