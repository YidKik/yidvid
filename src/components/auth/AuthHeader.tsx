
import { Video } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";

export const AuthHeader = () => {
  return (
    <DialogTitle className="text-center">
      <div className="flex flex-col items-center mb-6">
        <Video className="h-12 w-12 text-primary mb-2" />
        <h1 className="text-2xl font-bold text-primary">YidVid</h1>
      </div>
    </DialogTitle>
  );
};
