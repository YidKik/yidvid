
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
      className="mb-6"
    >
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
      
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
        className="text-5xl font-bold text-accent ml-3 inline-block"
      >
        to YidVid
      </motion.span>
      
      {userName && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.7,
          }}
          className="text-5xl font-bold text-primary ml-3 inline-block"
        >
          {userName}
        </motion.span>
      )}
    </motion.div>
  );
};
