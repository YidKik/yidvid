
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  icon: string;
  label: string;
  count: number;
  id: string;
}

// Color mapping for different categories
const categoryColors: { [key: string]: { bg: string; border: string; text: string } } = {
  music: { bg: '#FDE1D3', border: '#F97316', text: '#EA580C' },
  torah: { bg: '#E5DEFF', border: '#8B5CF6', text: '#6D28D9' },
  inspiration: { bg: '#D3E4FD', border: '#0EA5E9', text: '#0369A1' },
  podcast: { bg: '#FFDEE2', border: '#D946EF', text: '#A21CAF' },
  education: { bg: '#F2FCE2', border: '#84CC16', text: '#4D7C0F' },
  entertainment: { bg: '#FEF7CD', border: '#EAB308', text: '#CA8A04' },
  other: { bg: '#FEC6A1', border: '#F97316', text: '#EA580C' },
};

export const CategoryCard = ({ icon, label, count, id }: CategoryCardProps) => {
  const navigate = useNavigate();
  const colors = categoryColors[id] || categoryColors.other;

  const handleClick = () => {
    navigate(`/category/${id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl p-4 cursor-pointer transition-all duration-300 h-[120px] relative`}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <span 
          className="text-3xl p-2.5 rounded-lg"
          style={{
            background: `${colors.border}20`,
            color: colors.text
          }}
        >
          {icon}
        </span>
        <div className="flex-1">
          <h3 
            className="font-semibold text-base mb-1"
            style={{ color: colors.text }}
          >
            {label}
          </h3>
          <p className="text-sm text-[#8E9196] flex items-center">
            <span className="inline-flex items-center">
              {count} videos
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

