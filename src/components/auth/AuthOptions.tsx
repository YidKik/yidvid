import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { User, UserPlus } from "lucide-react";

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
  
  return (
    <div 
      className="flex flex-col items-center justify-center p-6 space-y-5 relative w-full"
      style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFCC00]" />
      
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center space-y-1 pt-1"
      >
        <h2 
          className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#1A1A1A]`}
          style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
        >
          Welcome! 👋
        </h2>
        <p 
          className="text-sm text-[#666666] font-medium"
          style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
        >
          Choose an option to continue
        </p>
      </motion.div>
      
      <div className="flex flex-col w-full space-y-3 px-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button 
            onClick={() => onSelectOption('signin')}
            className="w-full h-11 text-base bg-[#FF0000] hover:brightness-90 text-white rounded-xl font-semibold
              transition-all duration-200 shadow-md hover:shadow-lg
              flex items-center justify-center gap-2"
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            <User size={18} />
            Sign In
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button 
            onClick={() => onSelectOption('signup')}
            variant="outline"
            className="w-full h-11 text-base border-2 border-[#FFCC00] text-[#1A1A1A] bg-white hover:bg-[#FFCC00] 
              rounded-xl font-semibold transition-all duration-200
              shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            <UserPlus size={18} />
            Sign Up
          </Button>
        </motion.div>
      </div>
      
      {/* Friendly footer text */}
      <p className="text-xs text-[#999999] text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>
        Join our friendly community today!
      </p>
    </div>
  );
};
