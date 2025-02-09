
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
        {/* Base YouTube Logo */}
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
            src="/lovable-uploads/b9b6d425-5b4d-44dd-a983-c58a2c096e03.png"
            alt="YouTube Base"
            className="w-[85%] h-[85%] object-contain"
          />
        </motion.div>
        
        {/* Kippah Animation */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 150,
            delay: 0.8
          }}
          className="absolute w-full h-full flex items-start justify-center"
          style={{ top: "-5%" }}
        >
          <img
            src="/lovable-uploads/834fcef8-3a58-43fa-939a-47e825a37a8e.png"
            alt="Kippah"
            className="w-[35%] object-contain"
          />
        </motion.div>

        {/* Final state reference (invisible but helps maintain proportions) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0">
          <img
            src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
            alt="Reference"
            className="w-full h-full object-contain"
          />
        </div>
        
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
