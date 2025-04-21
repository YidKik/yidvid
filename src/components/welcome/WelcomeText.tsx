
import { motion } from "framer-motion";
import { useColors } from "@/contexts/ColorContext";

interface WelcomeTextProps {
  userName: string;
}

export const WelcomeText = ({ userName }: WelcomeTextProps) => {
  const { colors } = useColors();
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mb-6 space-y-4 relative"
    >
      {/* Animated background elements */}
      <motion.div 
        className="absolute -z-10 inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Dynamic animated gradient blobs */}
        <motion.div 
          className="absolute left-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            x: [-20, 30, -10],
            y: [0, 40, 10],
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute right-0 bottom-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 270, 180, 90, 0],
            x: [20, -30, 10],
            y: [0, -40, -10],
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute left-1/2 top-1/3 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.5, 1],
            x: [-100, 100, -100],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      </motion.div>

      {/* Foreground animated elements */}
      <motion.div className="space-y-2 relative">
        {/* Lines */}
        <motion.div
          className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <motion.div
          className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        
        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [Math.random() * 20, Math.random() * -20, Math.random() * 20],
              x: [Math.random() * 20, Math.random() * -20, Math.random() * 20],
              opacity: [0, 1, 0],
              scale: [0, Math.random() + 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        
        {/* Welcome text with enhanced animation */}
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
          className="text-6xl font-bold text-primary inline-block drop-shadow-sm"
        >
          Welcome to
        </motion.span>
        
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.5,
          }}
          className="flex items-center justify-center space-x-2"
        >
          {/* Animated username with glow effect */}
          <motion.span 
            className="text-6xl font-bold text-accent relative"
            whileHover={{ scale: 1.05 }}
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 10, delay: 0.7 }}
          >
            {userName || "YidVid"}
            <motion.span 
              className="absolute inset-0 bg-accent/10 blur-xl rounded-full -z-10"
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
                scale: [0.9, 1.05, 0.9]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Description text with enhanced animation */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="text-xl text-muted-foreground relative text-center mt-4"
      >
        <motion.span
          className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1, duration: 0.5 }}
        />
        <motion.span
          className="absolute -right-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-accent to-primary"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1, duration: 0.5 }}
        />
        <span className="relative">
          Your gateway to curated Jewish content
          <motion.span 
            className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          />
        </span>
      </motion.p>
    </motion.div>
  );
};
