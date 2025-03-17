
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
        className={`p-0 gap-0 border-none ${showOptions ? 'bg-transparent' : 'bg-white shadow-lg'} ${isMobile 
          ? 'w-[95%] max-w-[350px] max-h-[85vh] overflow-auto rounded-xl' 
          : 'sm:max-w-[650px] max-w-[650px] rounded-2xl overflow-hidden'
        }`}
      > 
        <AnimatePresence mode="wait">
          {showOptions ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              <AuthOptions onSelectOption={handleSelectOption} />
            </motion.div>
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col h-full rounded-2xl overflow-hidden border border-gray-200"
            >
              <AuthHeader onBack={handleBack} />
              <AuthForm 
                onOpenChange={onOpenChange} 
                initialTab={activeTab}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
