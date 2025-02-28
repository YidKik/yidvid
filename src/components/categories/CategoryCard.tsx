
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Music, BookOpen, Sparkles, Mic, GraduationCap, Film, PlusCircle } from "lucide-react";

interface CategoryCardProps {
  icon: string;
  label: string;
  id: string;
  isCustomImage?: boolean;
}

// Using cool, neutral colors for a "cold" aesthetic
const categoryColors = {
  bg: '#FFFFFF',
  border: '#8E9196', // Neutral gray border
  text: '#403E43',   // Charcoal gray text
  iconBg: '#33C3F0'  // Sky blue background for icons
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

  return (
    <motion.div
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        borderColor: "#33C3F0",
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
      <div className="flex items-center justify-between h-full px-1">
        <div className="flex items-center gap-2">
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
          <h3 
            className="font-medium text-[10px] leading-tight md:text-sm line-clamp-2 max-w-[60px] md:max-w-[120px]"
            style={{ color: categoryColors.text }}
          >
            {label}
          </h3>
        </div>
        
        {/* Minimal decorative elements with a cold aesthetic */}
        <div className="hidden md:block h-full w-8">
          <div className="h-full w-[1px] mx-auto bg-gradient-to-b from-transparent via-[#C8C8C9] to-transparent"></div>
        </div>
        
        {/* Mobile decorative element - simple dot */}
        <div className="md:hidden flex items-center">
          <div className="h-2 w-2 rounded-full bg-[#aaadb0]"></div>
        </div>
      </div>
    </motion.div>
  );
};
