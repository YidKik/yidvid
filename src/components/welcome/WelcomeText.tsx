
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
      <motion.div className="space-y-2">
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
          <span className="text-5xl font-bold text-accent">to YidVid</span>
          {userName && (
            <span className="text-5xl font-bold text-primary">{userName}</span>
          )}
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-lg text-muted-foreground"
      >
        Your gateway to curated Jewish content
      </motion.p>
    </motion.div>
  );
};
