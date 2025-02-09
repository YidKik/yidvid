
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
        y: -4,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 15
        }
      }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl p-2 md:p-4 cursor-pointer transition-all duration-300 h-[60px] md:h-[120px] relative backdrop-blur-sm"
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
      }}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        <motion.span 
          whileHover={{
            rotate: [0, -10, 10, -5, 5, 0],
            transition: {
              duration: 0.5
            }
          }}
          className="text-lg md:text-3xl p-1 md:p-2.5 rounded-lg"
          style={{
            background: `${colors.border}20`,
            color: colors.text
          }}
        >
          {isCustomImage ? (
            <img 
              src={icon} 
              alt={label}
              className="w-6 h-6 md:w-8 md:h-8 object-cover rounded"
            />
          ) : (
            icon
          )}
        </motion.span>
        <div className="flex-1">
          <h3 
            className="font-semibold text-[10px] md:text-base"
            style={{ color: colors.text }}
          >
            {label}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

