
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
      // Create more icons for a more spectacular effect
      const newIcons = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 400 - 200, // Even wider horizontal spread
        delay: Math.random() * 0.7,
      }));
      setIcons(newIcons);

      const timer = setTimeout(() => {
        console.log("Animation complete");
        onComplete();
        setIcons([]);
      }, 2500);

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
                  y: 250, 
                  x: icon.x,
                  rotate: 0
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.3, 1.8, 1.5, 0],
                  y: [250, -50, -200, -400],
                  x: [icon.x, icon.x * 1.3, icon.x * 1.1],
                  rotate: [0, 360, 720]
                }}
                transition={{
                  duration: 2.5,
                  delay: icon.delay,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="absolute"
              >
                <ThumbsUp className="text-red-500 fill-red-500 stroke-black stroke-2 w-8 h-8 md:w-12 md:h-12 drop-shadow-lg" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
