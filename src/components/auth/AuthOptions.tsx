import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { User, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface AuthOptionsProps {
  onSelectOption: (option: 'signin' | 'signup') => void;
  onClose?: () => void;
  hideCloseButton?: boolean;
}

export const AuthOptions = ({ 
  onSelectOption, 
  onClose,
  hideCloseButton = false 
}: AuthOptionsProps) => {
  const { isMobile } = useIsMobile();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) {
        console.error("Google sign-in error:", error);
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return (
    <div 
      className="flex flex-col items-center justify-center w-full relative"
      style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF0000] via-[#FFCC00] to-[#FF0000]" />
      
      {/* Hero section */}
      <div className="w-full bg-[#FAFAFA] px-8 pt-10 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="space-y-2"
        >
          <h2 
            className={`${isMobile ? 'text-2xl' : 'text-[28px]'} font-bold text-[#1A1A1A]`}
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            Welcome! 👋
          </h2>
          <p 
            className="text-base text-[#666666] font-medium max-w-[280px] mx-auto"
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            Sign in to your account or create a new one to get started
          </p>
        </motion.div>
      </div>
      
      {/* Buttons section */}
      <div className="flex flex-col w-full space-y-3 px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button 
            onClick={() => onSelectOption('signin')}
            className="w-full h-13 text-base bg-[#FF0000] hover:brightness-90 text-white rounded-2xl font-semibold
              transition-all duration-200 shadow-md hover:shadow-lg
              flex items-center justify-center gap-2.5 py-4"
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            <User size={20} />
            Sign In
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button 
            onClick={() => onSelectOption('signup')}
            variant="outline"
            className="w-full h-13 text-base border-2 border-[#FFCC00] text-[#1A1A1A] bg-white hover:bg-[#FFCC00] 
              rounded-2xl font-semibold transition-all duration-200
              shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 py-4"
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            <UserPlus size={20} />
            Create Account
          </Button>
        </motion.div>
      </div>
      
      {/* Footer */}
      <div className="px-8 pb-6">
        <p className="text-xs text-[#AAAAAA] text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Join our friendly community today!
        </p>
      </div>
    </div>
  );
};
