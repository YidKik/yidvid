
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
        className={`p-0 gap-0 border-none ${isMobile 
          ? 'bg-white w-[95%] max-w-[350px] max-h-[85vh] overflow-auto rounded-xl shadow-md border border-gray-100' 
          : 'sm:max-w-[450px] max-w-[450px] bg-white shadow-xl border border-[#E9ECEF] rounded-2xl overflow-hidden'
        }`}
      > 
        <AnimatePresence mode="wait">
          {showOptions ? (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AuthOptions onSelectOption={handleSelectOption} />
            </motion.div>
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
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
