
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Music, BookOpen, Sparkles, Mic, GraduationCap, Film, PlusCircle } from "lucide-react";

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
  // Fallback
  'default': <PlusCircle size={20} strokeWidth={1.5} color="white" />
};

export const CategoryCard = ({ icon, label, id, isCustomImage = false }: CategoryCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${id}`);
  };

  // Get the simple icon or use default if not found
  const getSimpleIcon = (iconEmoji: string) => {
    return simpleIcons[iconEmoji] || simpleIcons['default'];
  };

  // Animation variants for the line animation effect
  const lineVariants = {
    initial: (custom: number) => ({
      height: custom,
      opacity: 0.6,
    }),
    animate: (custom: number) => ({
      height: [custom, custom * 1.5, custom],
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

  // Animation variants for the icon
  const iconVariants = {
    initial: { 
      scale: 1,
      opacity: 0.9
    },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 3,
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
        y: -4,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 15
        }
      }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl p-2 md:p-3 cursor-pointer transition-all duration-300 h-[65px] md:h-[90px] relative backdrop-blur-sm"
      style={{
        background: categoryColors.bg,
        border: `1.5px solid ${categoryColors.border}`,
      }}
      onClick={handleClick}
    >
      <div className="flex items-center h-full px-1">
        <div className="flex items-center gap-2 flex-1">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={iconVariants}
            className="flex items-center justify-center"
          >
            <motion.span 
              whileHover={{
                rotate: [0, -10, 10, -5, 5, 0],
                transition: {
                  duration: 0.5
                }
              }}
              className="text-base md:text-2xl p-1 md:p-2 rounded-lg"
              style={{
                background: categoryColors.iconBg,
              }}
            >
              {isCustomImage ? (
                <img 
                  src={icon} 
                  alt={label}
                  className="w-4 h-4 md:w-6 md:h-6 object-cover rounded"
                />
              ) : (
                getSimpleIcon(icon)
              )}
            </motion.span>
          </motion.div>
          <h3 
            className="font-medium text-[10px] leading-tight md:text-sm line-clamp-2 max-w-[60px] md:max-w-[120px]"
            style={{ color: categoryColors.text }}
          >
            {label}
          </h3>
        </div>
        
        {/* Animated decorative lines for right side */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex space-x-1 md:space-x-2">
            <motion.div 
              custom={20}
              variants={lineVariants}
              initial="initial"
              animate="animate"
              className="w-[2px] md:w-[3px] rounded-full" 
              style={{ 
                background: `linear-gradient(to bottom, ${categoryColors.border}22, ${categoryColors.border}88)` 
              }}
            />
            <motion.div 
              custom={30}
              variants={lineVariants}
              initial="initial"
              animate="animate"
              className="w-[2px] md:w-[3px] rounded-full" 
              style={{ 
                background: `linear-gradient(to bottom, ${categoryColors.border}44, ${categoryColors.border})` 
              }}
            />
            <motion.div 
              custom={20}
              variants={lineVariants}
              initial="initial"
              animate="animate"
              className="w-[2px] md:w-[3px] rounded-full" 
              style={{ 
                background: `linear-gradient(to bottom, ${categoryColors.border}22, ${categoryColors.border}88)` 
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
