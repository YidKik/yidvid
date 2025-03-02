
import React from "react";
import { 
  Music, BookOpen, Sparkles, Mic, GraduationCap, Film, 
  PlusCircle, Tag, Star, Zap, Clock, Award, Bookmark, Smile 
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryIconProps {
  icon: string;
  isCustomImage?: boolean;
  iconBgColor: string;
}

// Simple icon mapping with outline-only style
const simpleIcons: Record<string, React.ReactNode> = {
  '🎵': <Music size={20} strokeWidth={1.5} color="white" />,
  '📖': <BookOpen size={20} strokeWidth={1.5} color="white" />,
  '✨': <Sparkles size={20} strokeWidth={1.5} color="white" />,
  '🎙️': <Mic size={20} strokeWidth={1.5} color="white" />,
  '📚': <GraduationCap size={20} strokeWidth={1.5} color="white" />,
  '🎬': <Film size={20} strokeWidth={1.5} color="white" />,
  '📌': <PlusCircle size={20} strokeWidth={1.5} color="white" />,
  '😄': <Smile size={20} strokeWidth={1.5} color="white" />,
  '🤣': <Star size={20} strokeWidth={1.5} color="white" />,
  '🔥': <Zap size={20} strokeWidth={1.5} color="white" />,
  '⏰': <Clock size={20} strokeWidth={1.5} color="white" />,
  '🏆': <Award size={20} strokeWidth={1.5} color="white" />,
  '🔖': <Bookmark size={20} strokeWidth={1.5} color="white" />,
  '🏷️': <Tag size={20} strokeWidth={1.5} color="white" />,
  'default': <Tag size={20} strokeWidth={1.5} color="white" />
};

export const CategoryIcon = ({ icon, isCustomImage = false, iconBgColor }: CategoryIconProps) => {
  const isMobile = useIsMobile();
  
  // Animation variants for the icon
  const iconVariants = {
    initial: { 
      scale: 1,
      opacity: 0.9
    },
    animate: {
      scale: isMobile ? [1, 1.05, 1] : [1, 1.1, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: isMobile ? 2 : 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      }
    }
  };

  // Get the simple icon or use default if not found
  const getSimpleIcon = (iconEmoji: string) => {
    const iconSize = isMobile ? 14 : 20;
    const IconComponent = simpleIcons[iconEmoji] || simpleIcons['default'];
    
    // Clone the icon element with the new size
    return React.cloneElement(IconComponent as React.ReactElement, { 
      size: iconSize 
    });
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={iconVariants}
      className="flex items-center justify-center"
    >
      <motion.span 
        whileHover={{
          rotate: [0, -5, 5, -3, 3, 0],
          transition: {
            duration: 0.3
          }
        }}
        className={`text-base md:text-2xl ${isMobile ? 'p-1' : 'p-1 md:p-2'} rounded-lg`}
        style={{
          background: iconBgColor,
        }}
      >
        {isCustomImage ? (
          // Replace custom image with appropriate outline icon
          <Tag size={isMobile ? 12 : 20} strokeWidth={1.5} color="white" />
        ) : (
          getSimpleIcon(icon)
        )}
      </motion.span>
    </motion.div>
  );
};
