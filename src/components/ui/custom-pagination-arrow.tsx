
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomPaginationArrowProps {
  direction: "left" | "right";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CustomPaginationArrow = ({
  direction,
  disabled = false,
  onClick,
  className = ""
}: CustomPaginationArrowProps) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`focus:outline-none transition-all duration-300 ${className}`}
      aria-label={direction === "left" ? "Previous page" : "Next page"}
    >
      <div className={`flex justify-center items-center rounded-full border-2 border-gray-200 w-10 h-10 group
        hover:border-primary hover:bg-white/80 
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
      >
        {direction === "left" ? (
          <ChevronLeft 
            className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" 
            strokeWidth={2.5}
          />
        ) : (
          <ChevronRight 
            className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" 
            strokeWidth={2.5}
          />
        )}
      </div>
    </button>
  );
};
