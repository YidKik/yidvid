
import { DialogTitle } from "@/components/ui/dialog";

export const AuthHeader = () => {
  return (
    <DialogTitle className="text-center">
      <div className="flex flex-col items-center mb-6">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
          alt="YidVid Logo"
          className="h-24 w-auto mb-2" // Increased height from h-12 to h-24
        />
      </div>
    </DialogTitle>
  );
};

