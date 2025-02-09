
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
      whileHover={{ scale: 1.02, x: 20 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:bg-accent/5"
      onClick={handleClick}
      layout
    >
      <div className="flex items-center space-x-4">
        <span className="text-4xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{label}</h3>
          <p className="text-sm text-gray-600">{count} videos</p>
        </div>
        <motion.div 
          className="text-primary"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          →
        </motion.div>
      </div>
    </motion.div>
  );
};

