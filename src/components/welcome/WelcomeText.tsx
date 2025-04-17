
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
      className="mb-6 space-y-4"
    >
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
          Welcome
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
          {!userName ? (
            <span className="text-5xl font-bold text-accent">to YidVid</span>
          ) : (
            <>
              <span className="text-5xl font-bold text-accent">{userName}</span>
              <span className="text-5xl font-bold text-primary">to YidVid</span>
            </>
          )}
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
