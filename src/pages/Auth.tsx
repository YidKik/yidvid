
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 border-none bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl"> 
        <AuthHeader />
        <AuthForm onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
