
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthOptions } from "@/components/auth/AuthOptions";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  const isMobile = useIsMobile();
  const [showOptions, setShowOptions] = useState(true);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const location = useLocation();
  const { isAuthenticated, session, isLoading } = useAuth();
  
  // Prevent dialog from showing automatically on settings page
  useEffect(() => {
    const isSettingsPage = location.pathname === "/settings";
    
    // Close the auth dialog if:
    // 1. User is already authenticated OR
    // 2. We're on the settings page (which requires auth)
    if ((isAuthenticated || isSettingsPage) && !isLoading && isOpen) {
      onOpenChange(false);
    }
  }, [isAuthenticated, isOpen, onOpenChange, location.pathname, isLoading]);
  
  const handleSelectOption = (option: 'signin' | 'signup') => {
    setActiveTab(option);
    setShowOptions(false);
  };
  
  const handleBack = () => {
    setShowOptions(true);
  };
  
  // Don't render if user is already authenticated
  if (isAuthenticated && !isLoading) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open === false) {
        // Reset to options screen when dialog closes
        setTimeout(() => setShowOptions(true), 300);
      }
      onOpenChange(open);
    }}>
      <DialogContent 
        hideCloseButton={true}
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
              <AuthOptions 
                onSelectOption={handleSelectOption} 
                onClose={() => onOpenChange(false)}
                hideCloseButton={true}
              />
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
              <AuthHeader 
                onBack={handleBack} 
                title={activeTab === 'signin' ? 'Welcome Back' : 'Join Our Community'}
                subtitle={activeTab === 'signin' ? 'Sign in for additional features' : 'Create an account to get started'}
              />
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
