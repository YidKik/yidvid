
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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

export const CategoryCard = ({ icon, label, id, isCustomImage = false }: CategoryCardProps) => {
  const navigate = useNavigate();

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
            color: 'white' // White fill
          }}
        >
          {isCustomImage ? (
            <img 
              src={icon} 
              alt={label}
              className="w-5 h-5 md:w-8 md:h-8 object-cover rounded"
            />
          ) : (
            <span className="text-white" style={{ 
              WebkitTextStroke: '1px black', // Black outline for icons (Webkit)
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' // Black outline fallback
            }}>
              {icon}
            </span>
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
