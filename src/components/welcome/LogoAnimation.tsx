
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
        {/* Main YouTube Logo (dark green circle) */}
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

        {/* Play Button (light green) */}
        <motion.div
          initial={{ scale: 0, x: -50 }}
          animate={{ 
            scale: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 300,
            delay: 1
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-primary/80"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>

        {/* Kippah (yellow part) */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ 
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            type: "spring",
            bounce: 0.5,
            delay: 0.8
          }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-16"
        >
          <svg
            viewBox="0 0 100 50"
            className="w-full h-full"
          >
            <path
              d="M10 40 C 30 0, 70 0, 90 40"
              fill="none"
              stroke="#FFD700"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
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
