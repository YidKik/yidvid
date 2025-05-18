
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
      const newIcons = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        delay: Math.random() * 0.5,
      }));
      setIcons(newIcons);

      const timer = setTimeout(() => {
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
          <div className="absolute top-0 left-0 right-0 bottom-0">
            {icons.map((icon) => (
              <motion.div
                key={icon.id}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  y: '80vh', 
                  x: `calc(50vw + ${icon.x}px)`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0],
                  y: ['80vh', '40vh', '10vh'],
                  x: [`calc(50vw + ${icon.x}px)`, `calc(50vw + ${icon.x * 1.5}px)`],
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
