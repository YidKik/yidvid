
import { motion, AnimatePresence } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { useEffect } from "react";

interface ContactSuccessOverlayProps {
  show: boolean;
  onComplete: () => void;
}

export const ContactSuccessOverlay = ({ show, onComplete }: ContactSuccessOverlayProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Blurred backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Animated circle with check */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {/* Outer ring pulse */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '3px solid #FFCC00' }}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '3px solid #FF0000' }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.4, delay: 0.8, ease: "easeOut" }}
              />

              {/* Main circle */}
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFCC00' }}
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                >
                  <Check className="w-12 h-12" style={{ color: '#222' }} strokeWidth={3} />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Mail icon floating up */}
            <motion.div
              className="absolute"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -80, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2, delay: 1, ease: "easeOut" }}
            >
              <Mail className="w-6 h-6" style={{ color: '#FF0000' }} />
            </motion.div>

            {/* Text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>
                Message Sent!
              </h3>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Thank you so much for your message
              </p>
            </motion.div>

            {/* Bottom accent bar */}
            <motion.div
              className="h-1 rounded-full"
              style={{ backgroundColor: '#FF0000' }}
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
