
import { useState, useEffect, useCallback } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthOptions } from "@/components/auth/AuthOptions";
import { AuthSuccessOverlay } from "@/components/auth/AuthSuccessOverlay";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'signin' | 'signup';
}

const Auth = ({ isOpen, onOpenChange, initialTab = 'signin' }: AuthProps) => {
  const { isMobile } = useIsMobile();
  const [showOptions, setShowOptions] = useState(true);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab || 'signin');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'signin' | 'signup'>('signin');
  const location = useLocation();
  const { isAuthenticated, session, isLoading } = useAuth();
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  useEffect(() => {
    if (isAuthenticated && !isLoading && isOpen) {
      if (!showSuccess) {
        onOpenChange(false);
      }
    }
  }, [isAuthenticated, isOpen, onOpenChange, isLoading, showSuccess]);
  
  const handleSelectOption = (option: 'signin' | 'signup') => {
    setActiveTab(option);
    setShowOptions(false);
  };
  
  const handleBack = () => {
    setShowOptions(true);
  };

  const handleAuthSuccess = useCallback((type: 'signin' | 'signup') => {
    setSuccessType(type);
    onOpenChange(false);
    setShowSuccess(true);
  }, [onOpenChange]);

  const handleSuccessComplete = useCallback(() => {
    setShowSuccess(false);
  }, []);
  
  if (isAuthenticated && !isLoading && !showSuccess) {
    return null;
  }
  
  return (
    <>
      <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => {
        if (open === false) {
          setTimeout(() => setShowOptions(true), 300);
        }
        onOpenChange(open);
      }}>
        <DialogPrimitive.Portal>
          {/* Smooth overlay */}
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            style={{
              animation: isOpen ? 'authFadeIn 0.3s ease-out' : undefined,
            }}
          />

          {/* Dialog content with smooth custom animation */}
          <DialogPrimitive.Content
            className={`fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] ${isMobile 
              ? 'w-[92%] max-w-[420px]' 
              : 'w-[460px] max-w-[460px]'
            } rounded-3xl overflow-hidden p-0 border-none bg-white shadow-2xl`}
            style={{
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
              animation: isOpen ? 'authScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
            }}
          >
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ color: '#666' }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <AnimatePresence mode="wait">
              {showOptions ? (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col h-full rounded-3xl overflow-hidden"
                >
                  <AuthHeader 
                    onBack={handleBack} 
                    title={activeTab === 'signin' ? 'Welcome Back' : 'Join Our Community'}
                    subtitle={activeTab === 'signin' ? 'Sign in for additional features' : 'Create an account to get started'}
                  />
                  <AuthForm 
                    onOpenChange={(open) => {
                      if (!open) {
                        handleAuthSuccess(activeTab);
                      } else {
                        onOpenChange(open);
                      }
                    }}
                    initialTab={activeTab}
                    hideOptions={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>

        <style>{`
          @keyframes authFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes authScaleIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>
      </DialogPrimitive.Root>

      <AuthSuccessOverlay 
        show={showSuccess} 
        type={successType} 
        onComplete={handleSuccessComplete} 
      />
    </>
  );
};

export default Auth;
