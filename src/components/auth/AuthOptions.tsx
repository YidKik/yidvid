
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface AuthOptionsProps {
  onSelectOption: (option: 'signin' | 'signup') => void;
}

export const AuthOptions = ({ onSelectOption }: AuthOptionsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold text-gray-800">Welcome</h2>
        <p className="text-gray-500">Choose an option to continue</p>
      </motion.div>
      
      <div className="flex flex-col w-full space-y-4 mt-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button 
            onClick={() => onSelectOption('signin')}
            className={`w-full ${isMobile 
              ? 'h-12 text-base' 
              : 'h-16 text-lg'} 
              bg-[#ea384c] hover:bg-red-700 text-white rounded-lg font-medium
              transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg`}
          >
            Sign In
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button 
            onClick={() => onSelectOption('signup')}
            variant="outline"
            className={`w-full ${isMobile 
              ? 'h-12 text-base' 
              : 'h-16 text-lg'} 
              border-[#ea384c] text-[#ea384c] hover:bg-red-50 hover:text-red-700 hover:border-red-700
              rounded-lg font-medium transition-all duration-300
              hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md`}
          >
            Sign Up
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
