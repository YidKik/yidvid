
import { motion } from "framer-motion";

interface CategoryCardProps {
  icon: string;
  label: string;
  count: number;
}

export const CategoryCard = ({ icon, label, count }: CategoryCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <span className="text-4xl mb-2">{icon}</span>
        <h3 className="font-semibold text-lg">{label}</h3>
        <p className="text-sm text-gray-600">{count} videos</p>
      </div>
    </motion.div>
  );
};
