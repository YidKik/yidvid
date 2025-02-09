
import { motion } from "framer-motion";

export const LogoAnimation = () => {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 1.2, 1],
          opacity: 1,
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
          times: [0, 0.7, 1],
          delay: 0.2
        }}
        className="relative w-full h-full"
      >
        {/* Main Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 200,
            delay: 0.4
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img
            src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
            alt="YidVid Logo"
            className="w-full h-full object-contain"
          />
        </motion.div>
        
        {/* Pulsing background effect */}
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ 
            scale: [1.2, 1],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute inset-0 bg-primary rounded-full -z-10"
        />
      </motion.div>
    </div>
  );
};

