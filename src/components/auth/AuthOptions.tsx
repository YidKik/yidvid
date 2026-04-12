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

        {/* Divider */}
        <div className="relative flex items-center w-full py-1">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs text-[#AAAAAA] font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            variant="outline"
            className="w-full h-13 text-base border-2 border-gray-200 text-[#1A1A1A] bg-white hover:bg-gray-50 
              rounded-2xl font-semibold transition-all duration-200
              shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 py-4"
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </Button>
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
