
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`p-0 gap-0 border-none bg-white/95 backdrop-blur-sm shadow-2xl
          ${isMobile 
            ? 'w-[85%] max-w-[320px] max-h-[75vh] overflow-auto rounded-lg scale-90' 
            : 'sm:max-w-[450px] rounded-2xl'
          }`}
      > 
        <AuthHeader />
        <AuthForm onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
