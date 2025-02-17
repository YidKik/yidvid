
import { DialogTitle } from "@/components/ui/dialog";

export const AuthHeader = () => {
  return (
    <DialogTitle className="text-center py-8 px-8 border-b border-gray-100/50">
      <div className="flex flex-col items-center">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
          alt="YidVid Logo"
          className="h-20 w-auto mb-4 drop-shadow-md hover:scale-105 transition-transform duration-300"
        />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to YidVid</h2>
        <p className="text-sm text-gray-500">Your Premier Jewish Platform</p>
      </div>
    </DialogTitle>
  );
};
