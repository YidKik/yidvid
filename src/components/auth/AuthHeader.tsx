
import { DialogTitle } from "@/components/ui/dialog";

export const AuthHeader = () => {
  return (
    <DialogTitle className="text-center py-6 px-8 border-b border-gray-100">
      <div className="flex flex-col items-center">
        <img 
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
          alt="YidVid Logo"
          className="h-16 w-auto mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-800">Welcome to YidVid</h2>
        <p className="text-sm text-gray-500 mt-1">Your Premier Jewish Video Platform</p>
      </div>
    </DialogTitle>
  );
};

