import { motion } from "framer-motion";

interface WelcomeTextProps {
  userName: string;
}

export const WelcomeText = ({ userName }: WelcomeTextProps) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mb-6 space-y-4 relative"
    >
      {/* Animated background elements */}
      <motion.div 
        className="absolute -z-10 inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="absolute left-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute right-0 bottom-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </motion.div>

      <motion.div className="space-y-2 relative">
        <motion.div
          className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <motion.div
          className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
        
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
          className="text-5xl font-bold text-primary inline-block"
        >
          Welcome to
        </motion.span>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.5,
          }}
          className="flex items-center justify-center space-x-2"
        >
          <motion.span 
            className="text-5xl font-bold text-accent"
            whileHover={{ scale: 1.05 }}
          >
            {userName || "Edward"}
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-lg text-muted-foreground relative"
      >
        <motion.span
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1, duration: 0.5 }}
        />
        <motion.span
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1, duration: 0.5 }}
        />
        Your gateway to curated Jewish content
      </motion.p>
    </motion.div>
  );
};
