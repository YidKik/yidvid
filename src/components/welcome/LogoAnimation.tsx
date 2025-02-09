
import { motion } from "framer-motion";

export const LogoAnimation = () => {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.2
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Complete Logo */}
        <motion.img
          src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
          alt="Logo"
          className="w-full h-full object-contain z-10"
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: 0.3
          }}
        />
        
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

