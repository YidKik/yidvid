
import { useIsMobile } from "@/hooks/useIsMobile";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface AuthHeaderProps {
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthHeader = ({ onBack, title, subtitle }: AuthHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col ${isMobile ? 'px-4 py-3' : 'px-8 py-6'} bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100`}>
      <div className="flex items-center">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2 h-8 w-8 rounded-full"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Button>
        )}
        {!onBack && <div className="h-8" />}
      </div>
      
      <div className="text-center mt-3">
        {title && <h3 className="text-xl font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
