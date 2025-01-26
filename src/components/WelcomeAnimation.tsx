import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const WelcomeAnimation = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000); // 3 seconds duration

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-lg"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
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
                Jewish
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
                Tube
              </motion.span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.7,
              }}
              className="relative w-24 h-24 mx-auto mb-6"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-primary"
                fill="currentColor"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute inset-0 bg-primary/10 rounded-full"
              />
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xl text-muted-foreground"
            >
              Your source for Jewish content
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};