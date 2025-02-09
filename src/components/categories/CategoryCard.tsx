
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
      className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:bg-accent/5 min-h-[180px]"
      onClick={handleClick}
      layout
    >
      <div className="flex items-center space-x-6">
        <span className="text-6xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-2xl mb-2">{label}</h3>
          <p className="text-lg text-gray-600">{count} videos</p>
        </div>
        <motion.div 
          className="text-primary text-3xl"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          ↓
        </motion.div>
      </div>
    </motion.div>
  );
};
