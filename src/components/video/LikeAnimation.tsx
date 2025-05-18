
import { useEffect, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LikeAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const LikeAnimation = ({ isVisible, onComplete }: LikeAnimationProps) => {
  const [icons, setIcons] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    if (isVisible) {
      console.log("Animation triggered - generating icons");
      // Create more icons for a more visible effect
      const newIcons = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 300 - 150, // More horizontal spread
        delay: Math.random() * 0.5,
      }));
      setIcons(newIcons);

      const timer = setTimeout(() => {
        console.log("Animation complete");
        onComplete();
        setIcons([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            {icons.map((icon) => (
              <motion.div
                key={icon.id}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  y: 200, 
                  x: icon.x
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0],
                  y: [200, -100, -300],
                  x: [icon.x, icon.x * 1.2],
                }}
                transition={{
                  duration: 2,
                  delay: icon.delay,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="absolute"
              >
                <ThumbsUp className="text-primary fill-primary w-8 h-8 md:w-10 md:h-10" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
