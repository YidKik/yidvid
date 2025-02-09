
import { DialogTitle } from "@/components/ui/dialog";

export const AuthHeader = () => {
  return (
    <DialogTitle className="text-center mt-4 sm:mt-8">
      <div className="flex flex-col items-center">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
          alt="YidVid Logo"
          className="h-32 sm:h-44 w-auto mb-2 sm:mb-4" // Responsive height for mobile
        />
      </div>
    </DialogTitle>
  );
};
