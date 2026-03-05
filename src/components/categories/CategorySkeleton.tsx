
import React from "react";
import { Loader2 } from "lucide-react";

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-[55px] md:h-[150px] w-full">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
};
