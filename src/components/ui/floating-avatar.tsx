
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
          y: [0, 15, 0],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Avatar className={cn(
          "border-2 border-white/10 shadow-lg",
          sizes[size]
        )}>
          <AvatarImage src={imageUrl || undefined} alt="Channel avatar" />
          <AvatarFallback>YV</AvatarFallback>
        </Avatar>
      </motion.div>
    </motion.div>
  );
}
