
import { useIsMobile } from "@/hooks/use-mobile";
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
    <div className={`flex flex-col ${isMobile ? 'px-4 py-3' : 'px-8 py-6'} bg-transparent border-b border-gray-100`}>
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
        <div className="flex-1 flex justify-center">
          <img
            src="/lovable-uploads/0a422655-cf47-4789-bf38-ed05cc6bd4f6.png"
            alt="YidVid Logo"
            className={`${isMobile ? 'h-10' : 'h-14'} object-contain`}
            onError={(e) => {
              console.error('Logo failed to load:', e);
              e.currentTarget.src = '/favicon.ico';
            }}
          />
        </div>
        {onBack && <div className="w-8" />}
      </div>
      
      {(title || subtitle) && (
        <div className="text-center mt-3">
          {title && <h3 className="text-xl font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};
