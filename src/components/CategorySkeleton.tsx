
import React from "react";
import { Loader2 } from "lucide-react";

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-[100px] md:h-[150px]">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
};
