
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface FloatingAvatarProps {
  imageUrl: string | null;
  delay?: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function FloatingAvatar({ imageUrl, delay = 0, className, size = "md" }: FloatingAvatarProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-32 h-32"
  };

  const [currentImage, setCurrentImage] = useState(imageUrl);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(imageUrl);
    }, 4000); // Changed to 4 seconds for more frequent transitions

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
          scale: [1, 1.2, 1],
          y: [0, 25, 0],
          x: [0, 15, 0, -15, 0],
          rotate: [0, 8, 0, -8, 0],
        }}
        transition={{
          duration: 8,
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
              filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 1,
              ease: "easeInOut"
            }}
          >
            <Avatar className={cn(
              "border-2 border-white/20 shadow-lg backdrop-blur-sm",
              "hover:border-white/40 transition-colors duration-500",
              "after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_0_30px_rgba(255,255,255,0.2)]",
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
