
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  icon: string;
  label: string;
  count: number;
  id: string;
}

export const CategoryCard = ({ icon, label, count, id }: CategoryCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl p-4 cursor-pointer transition-all duration-300 h-[120px]"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <span className="text-3xl p-2 rounded-lg">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1 text-[#6E59A5]">{label}</h3>
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
