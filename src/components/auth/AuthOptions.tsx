
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col items-center justify-center p-8 space-y-8 backdrop-blur-md rounded-2xl relative">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center space-y-2"
      >
        <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-white`}>Welcome</h2>
        <p className={`${isMobile ? 'text-base' : 'text-xl'} text-white font-medium`}>Choose an option to continue</p>
      </motion.div>
      
      <div className={`flex flex-col w-full space-y-6 ${isMobile ? 'max-w-[280px]' : 'max-w-[320px]'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button 
            onClick={() => onSelectOption('signin')}
            className={`w-full ${isMobile 
              ? 'h-12 text-base' 
              : 'h-14 text-lg'} 
              bg-[#ea384c] hover:bg-red-700 text-white rounded-xl font-medium
              transition-all duration-300 shadow-lg hover:shadow-xl
              hover:shadow-red-300/20 relative overflow-hidden
              before:content-[''] before:absolute before:top-0 before:left-0 
              before:w-full before:h-full before:bg-gradient-to-r 
              before:from-transparent before:via-white/20 before:to-transparent 
              before:translate-x-[-100%] hover:before:translate-x-[100%] 
              before:transition-transform before:duration-[0.6s] before:ease-in-out`}
          >
            Sign In
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button 
            onClick={() => onSelectOption('signup')}
            variant="outline"
            className={`w-full ${isMobile 
              ? 'h-12 text-base' 
              : 'h-14 text-lg'} 
              border-2 border-white/70 text-white bg-white/10 hover:bg-white/20 
              rounded-xl font-medium transition-all duration-300
              shadow-md hover:shadow-lg hover:shadow-white/10`}
          >
            Sign Up
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
