
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface FloatingAvatarProps {
  imageUrl: string | null;
  delay?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FloatingAvatar({ imageUrl, delay = 0, className, size = "md" }: FloatingAvatarProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  const [currentImage, setCurrentImage] = useState(imageUrl);

  // Effect to change image every 5 seconds with fade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(imageUrl);
    }, 5000);

    return () => clearInterval(timer);
  }, [imageUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut"
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          y: [0, 15, 0],
          x: [0, 10, 0, -10, 0],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage || "fallback"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          >
            <Avatar className={cn(
              "border-2 border-white/10 shadow-lg backdrop-blur-sm",
              "hover:border-white/20 transition-colors",
              "after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]",
              sizes[size]
            )}>
              <AvatarImage src={currentImage || undefined} alt="Channel avatar" />
              <AvatarFallback>YV</AvatarFallback>
            </Avatar>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
