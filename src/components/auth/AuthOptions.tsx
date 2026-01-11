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
      className="flex flex-col items-center justify-center p-8 space-y-6 rounded-3xl relative bg-white border-2 border-yellow-300 shadow-2xl"
      style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-400 rounded-t-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center space-y-2 pt-2"
      >
        <h2 
          className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800`}
          style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
        >
          Welcome! 👋
        </h2>
        <p 
          className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 font-medium`}
          style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
        >
          Choose an option to continue
        </p>
      </motion.div>
      
      <div className={`flex flex-col w-full space-y-4 ${isMobile ? 'max-w-[260px]' : 'max-w-[300px]'}`}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={() => onSelectOption('signin')}
            className={`w-full ${isMobile 
              ? 'h-12 text-base' 
              : 'h-14 text-lg'} 
              bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold
              transition-all duration-200 shadow-md hover:shadow-lg
              flex items-center justify-center gap-2`}
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            <User size={20} />
            Sign In
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={() => onSelectOption('signup')}
            variant="outline"
            className={`w-full ${isMobile 
              ? 'h-12 text-base' 
              : 'h-14 text-lg'} 
              border-2 border-yellow-400 text-gray-800 bg-yellow-50 hover:bg-yellow-100 
              rounded-xl font-semibold transition-all duration-200
              shadow-sm hover:shadow-md flex items-center justify-center gap-2`}
            style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
          >
            <UserPlus size={20} />
            Sign Up
          </Button>
        </motion.div>
      </div>
      
      {/* Friendly footer text */}
      <p className="text-xs text-gray-500 text-center pt-2" style={{ fontFamily: "'Quicksand', sans-serif" }}>
        Join our friendly community today!
      </p>
    </div>
  );
};
