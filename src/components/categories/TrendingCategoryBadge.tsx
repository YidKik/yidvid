
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface TrendingCategoryBadgeProps {
  count: number;
}

export const TrendingCategoryBadge = ({ count }: TrendingCategoryBadgeProps) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-2 -right-2 z-10"
    >
      <Badge className="bg-red-500 text-white flex items-center gap-1 px-2">
        <TrendingUp className="w-3 h-3" />
        <span className="text-xs">{count}</span>
      </Badge>
    </motion.div>
  );
};

