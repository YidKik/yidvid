import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Music, BookOpen, Sparkles, Mic, GraduationCap, Film, PlusCircle, Tag, Heart, Star, Zap, Clock, Award, Bookmark, Smile } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryCardProps {
  icon: string;
  label: string;
  id: string;
  isCustomImage?: boolean;
}

// Using the primary color for all categories
const categoryColors = {
  bg: '#FFFFFF',
  border: '#ea384c',
  text: '#333333',
  iconBg: '#ea384c'
};

// More representative icon mapping with outline-only style
const simpleIcons: Record<string, React.ReactNode> = {
  '🎵': <Music size={20} strokeWidth={1.5} color="white" />,
  '📖': <BookOpen size={20} strokeWidth={1.5} color="white" />,
  '✨': <Sparkles size={20} strokeWidth={1.5} color="white" />,
  '🎙️': <Mic size={20} strokeWidth={1.5} color="white" />,
  '📚': <GraduationCap size={20} strokeWidth={1.5} color="white" />,
  '🎬': <Film size={20} strokeWidth={1.5} color="white" />,
  '📌': <PlusCircle size={20} strokeWidth={1.5} color="white" />,
  '😄': <Smile size={20} strokeWidth={1.5} color="white" />, // Changed to Smile icon for funny category
  '🤣': <Star size={20} strokeWidth={1.5} color="white" />,
  '🔥': <Zap size={20} strokeWidth={1.5} color="white" />,
  '⏰': <Clock size={20} strokeWidth={1.5} color="white" />,
  '🏆': <Award size={20} strokeWidth={1.5} color="white" />,
  '🔖': <Bookmark size={20} strokeWidth={1.5} color="white" />,
  '🏷️': <Tag size={20} strokeWidth={1.5} color="white" />,
  'default': <Tag size={20} strokeWidth={1.5} color="white" />
};

export const CategoryCard = ({ icon, label, id, isCustomImage = false }: CategoryCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleClick = () => {
    navigate(`/category/${id}`);
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

  // Animation variants for the line animation effect - adjusted for mobile
  const lineVariants = {
    initial: (custom: number) => ({
      height: isMobile ? custom * 0.7 : custom,
      opacity: 0.6,
    }),
    animate: (custom: number) => ({
      height: isMobile ? 
        [custom * 0.7, custom * 0.9, custom * 0.7] : 
        [custom, custom * 1.5, custom],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
        delay: custom * 0.05,
      },
    }),
  };

  // Animation variants for the icon - adjusted for mobile
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

  return (
    <motion.div
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        borderColor: "#d6293d",
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 15
        }
      }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl p-1 md:p-3 cursor-pointer transition-all duration-300 ${isMobile ? 'h-[55px]' : 'h-[90px]'} relative backdrop-blur-sm`}
      style={{
        background: categoryColors.bg,
        border: `1.5px solid ${categoryColors.border}`,
      }}
      onClick={handleClick}
    >
      <div className="flex items-center h-full px-1">
        <div className="flex items-center gap-1 md:gap-2 flex-1">
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
                background: categoryColors.iconBg,
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
          <h3 
            className={`font-medium text-[10px] leading-tight md:text-sm line-clamp-2 ${isMobile ? 'max-w-[85px]' : 'max-w-[120px]'}`}
            style={{ color: categoryColors.text }}
          >
            {label}
          </h3>
        </div>
        
        {/* Animated decorative lines for right side - only show on desktop */}
        {!isMobile && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex space-x-1 md:space-x-2">
              <motion.div 
                custom={isMobile ? 15 : 20}
                variants={lineVariants}
                initial="initial"
                animate="animate"
                className={`w-[1px] md:w-[3px] rounded-full`}
                style={{ 
                  background: `linear-gradient(to bottom, ${categoryColors.border}22, ${categoryColors.border}88)` 
                }}
              />
              <motion.div 
                custom={isMobile ? 20 : 30}
                variants={lineVariants}
                initial="initial"
                animate="animate"
                className={`w-[1px] md:w-[3px] rounded-full`}
                style={{ 
                  background: `linear-gradient(to bottom, ${categoryColors.border}44, ${categoryColors.border})` 
                }}
              />
              <motion.div 
                custom={isMobile ? 15 : 20}
                variants={lineVariants}
                initial="initial"
                animate="animate"
                className={`w-[1px] md:w-[3px] rounded-full`}
                style={{ 
                  background: `linear-gradient(to bottom, ${categoryColors.border}22, ${categoryColors.border}88)` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
