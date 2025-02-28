
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

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        y: -4,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
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
      <div className="flex flex-col md:flex-row items-center md:space-x-2 h-full">
        <motion.span 
          whileHover={{
            rotate: [0, -10, 10, -5, 5, 0],
            transition: {
              duration: 0.5
            }
          }}
          className="text-base md:text-2xl p-1 md:p-2 rounded-lg mb-1 md:mb-0"
          style={{
            background: categoryColors.iconBg, // Red background for icons
          }}
        >
          {isCustomImage ? (
            <img 
              src={icon} 
              alt={label}
              className="w-4 h-4 md:w-6 md:h-6 object-cover rounded"
            />
          ) : (
            // Use the simple icon from our mapping instead of emoji
            getSimpleIcon(icon)
          )}
        </motion.span>
        <div className="flex-1 text-center md:text-left">
          <h3 
            className="font-medium text-[10px] leading-tight md:text-sm line-clamp-2 md:line-clamp-1"
            style={{ color: categoryColors.text }}
          >
            {label}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};
