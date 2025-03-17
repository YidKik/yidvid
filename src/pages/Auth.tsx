
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthOptions } from "@/components/auth/AuthOptions";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  const isMobile = useIsMobile();
  const [showOptions, setShowOptions] = useState(true);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  const handleSelectOption = (option: 'signin' | 'signup') => {
    setActiveTab(option);
    setShowOptions(false);
  };
  
  const handleBack = () => {
    setShowOptions(true);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open === false) {
        // Reset to options screen when dialog closes
        setTimeout(() => setShowOptions(true), 300);
      }
      onOpenChange(open);
    }}>
      <DialogContent 
        className={`p-0 gap-0 ${showOptions ? 'bg-transparent border-none' : 'bg-white border border-gray-200 shadow-lg'} ${isMobile 
          ? 'w-[95%] max-w-[350px] max-h-[85vh] overflow-auto rounded-xl' 
          : 'sm:max-w-[500px] max-w-[500px] rounded-2xl overflow-hidden'
        }`}
      > 
        <AnimatePresence mode="wait">
          {showOptions ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              <AuthOptions onSelectOption={handleSelectOption} />
            </motion.div>
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 20, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: 20, rotateX: -10 }}
              transition={{ duration: 0.2, ease: [0.19, 1.0, 0.22, 1.0] }}
              className="flex flex-col h-full rounded-2xl overflow-hidden"
            >
              <AuthHeader onBack={handleBack} />
              <AuthForm 
                onOpenChange={onOpenChange} 
                initialTab={activeTab}
                hideOptions={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
