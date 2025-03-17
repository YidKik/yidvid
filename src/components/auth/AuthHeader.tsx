
import { DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export const AuthHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <DialogTitle className={`text-center ${isMobile ? 'py-4 px-4' : 'py-8 px-8'} border-b border-gray-100/50`}>
      <div className="flex flex-col items-center">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
          alt="YidVid Logo"
          className={`${isMobile ? 'h-16' : 'h-32'} w-auto mb-2 drop-shadow-lg hover:scale-105 transition-transform duration-300`}
        />
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-800 mb-1`}>Welcome to YidVid</h2>
        <p className="text-xs text-gray-500">Your Premier Jewish Platform</p>
      </div>
    </DialogTitle>
  );
};
