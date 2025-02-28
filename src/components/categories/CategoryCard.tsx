
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

// More representative icon mapping
const simpleIcons: Record<string, React.ReactNode> = {
  '🎵': <Music strokeWidth={1} fill="white" />,
  '📖': <BookOpen strokeWidth={1} fill="white" />,
  '✨': <Sparkles strokeWidth={1} fill="white" />,
  '🎙️': <Mic strokeWidth={1} fill="white" />,
  '📚': <GraduationCap strokeWidth={1} fill="white" />,
  '🎬': <Film strokeWidth={1} fill="white" />,
  '📌': <PlusCircle strokeWidth={1} fill="white" />,
  // Fallback
  'default': <PlusCircle strokeWidth={1} fill="white" />
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
      className="rounded-xl p-2 md:p-4 cursor-pointer transition-all duration-300 h-[80px] md:h-[120px] relative backdrop-blur-sm"
      style={{
        background: categoryColors.bg,
        border: `2px solid ${categoryColors.border}`,
      }}
      onClick={handleClick}
    >
      <div className="flex flex-col md:flex-row items-center md:space-x-3 h-full">
        <motion.span 
          whileHover={{
            rotate: [0, -10, 10, -5, 5, 0],
            transition: {
              duration: 0.5
            }
          }}
          className="text-base md:text-3xl p-1 md:p-2.5 rounded-lg mb-1 md:mb-0"
          style={{
            background: categoryColors.iconBg, // Red background for icons
          }}
        >
          {isCustomImage ? (
            <img 
              src={icon} 
              alt={label}
              className="w-5 h-5 md:w-8 md:h-8 object-cover rounded"
            />
          ) : (
            // Use the simple icon from our mapping instead of emoji
            getSimpleIcon(icon)
          )}
        </motion.span>
        <div className="flex-1 text-center md:text-left">
          <h3 
            className="font-medium text-[11px] leading-tight md:text-base line-clamp-2 md:line-clamp-1"
            style={{ color: categoryColors.text }}
          >
            {label}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};
