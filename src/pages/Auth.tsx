
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
        className={`p-0 gap-0 border-none ${isMobile 
          ? 'bg-white w-[90%] max-w-[340px] max-h-[80vh] overflow-auto rounded-xl scale-95 shadow-lg border border-gray-100' 
          : 'sm:max-w-[950px] max-w-[950px] bg-white shadow-xl border border-[#E9ECEF] rounded-2xl overflow-hidden'
        }`}
      > 
        <AuthHeader />
        <AuthForm onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
