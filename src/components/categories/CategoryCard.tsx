
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  icon: string;
  label: string;
  id: string;
  isCustomImage?: boolean;
}

const categoryColors: { [key: string]: { bg: string; border: string; text: string } } = {
  music: { bg: '#FFFFFF', border: '#ea384c', text: '#333333' },
  torah: { bg: '#FFFFFF', border: '#ea384c', text: '#333333' },
  inspiration: { bg: '#FFFFFF', border: '#ea384c', text: '#333333' },
  podcast: { bg: '#FFFFFF', border: '#ea384c', text: '#333333' },
  education: { bg: '#FFFFFF', border: '#ea384c', text: '#333333' },
  entertainment: { bg: '#FFFFFF', border: '#ea384c', text: '#333333' },
  other: { bg: '#FFFFFF', border: '#ea384c', text: '#333333' },
};

export const CategoryCard = ({ icon, label, id, isCustomImage = false }: CategoryCardProps) => {
  const navigate = useNavigate();
  const colors = categoryColors[id] || categoryColors.other;

  const handleClick = () => {
    navigate(`/category/${id}`);
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        y: -2,
        boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 15
        }
      }}
      whileTap={{ scale: 0.98 }}
      className="rounded-lg p-2 md:p-3 cursor-pointer transition-all duration-300 h-[40px] md:h-[60px] relative backdrop-blur-sm"
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
      }}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-1.5 md:space-x-2">
        <motion.span 
          whileHover={{
            rotate: [0, -10, 10, -5, 5, 0],
            transition: {
              duration: 0.5
            }
          }}
          className="text-base md:text-xl p-0.5 md:p-1 rounded-lg"
          style={{
            background: `${colors.border}20`,
            color: colors.text
          }}
        >
          {isCustomImage ? (
            <img 
              src={icon} 
              alt={label}
              className="w-4 h-4 md:w-6 md:h-6 object-cover rounded"
            />
          ) : (
            icon
          )}
        </motion.span>
        <div className="flex-1">
          <h3 
            className="font-medium text-[9px] md:text-sm truncate"
            style={{ color: colors.text }}
          >
            {label}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};
