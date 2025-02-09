
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
      className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 cursor-pointer 
                hover:shadow-[0_8px_30px_rgba(155,135,245,0.3)] transition-all duration-300 
                transform hover:bg-gradient-to-br from-white via-white to-[#f5f3ff] 
                border border-[#f5f3ff] h-[120px]"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <span className="text-3xl bg-[#9b87f5]/10 p-2 rounded-lg">{icon}</span>
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
