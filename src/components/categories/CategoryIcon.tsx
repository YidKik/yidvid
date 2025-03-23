
import React from "react";
import { 
  Music, BookOpen, Sparkles, Mic, GraduationCap, Film, 
  PlusCircle, Tag, Star, Zap, Clock, Award, Bookmark, Smile,
  LucideProps
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryIconProps {
  icon: string;
  isCustomImage?: boolean;
  iconBgColor: string;
}

// Type definition for the icon mapping
type IconComponent = React.ComponentType<LucideProps>;

// Simple icon mapping with outline-only style
const simpleIcons: Record<string, IconComponent> = {
  '🎵': Music,
  '📖': BookOpen,
  '✨': Sparkles,
  '🎙️': Mic,
  '📚': GraduationCap,
  '🎬': Film,
  '📌': PlusCircle,
  '😄': Smile,
  '🤣': Star,
  '🔥': Zap,
  '⏰': Clock,
  '🏆': Award,
  '🔖': Bookmark,
  '🏷️': Tag,
  'default': Tag
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

  // Get the icon component
  const getIconComponent = (iconEmoji: string) => {
    const iconSize = isMobile ? 14 : 20;
    const IconComponent = simpleIcons[iconEmoji] || simpleIcons['default'];
    
    return <IconComponent size={iconSize} strokeWidth={1.5} color="white" />;
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
        className={`text-base md:text-2xl ${isMobile ? 'p-1' : 'p-1 md:p-2'} rounded-lg flex items-center justify-center`}
        style={{
          background: iconBgColor,
          minWidth: isMobile ? '24px' : '36px',
          minHeight: isMobile ? '24px' : '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isCustomImage ? (
          // Replace custom image with appropriate outline icon
          <Tag size={isMobile ? 12 : 20} strokeWidth={1.5} color="white" />
        ) : (
          getIconComponent(icon)
        )}
      </motion.span>
    </motion.div>
  );
};
