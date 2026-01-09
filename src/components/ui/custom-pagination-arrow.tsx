
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
  const label = direction === "left" ? "Back Page" : "Next Page";
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`focus:outline-none transition-all duration-300 group ${className}`}
      aria-label={direction === "left" ? "Previous page" : "Next page"}
    >
      <div 
        className={`flex justify-center items-center rounded-full border-2 border-gray-200 
          h-10 px-3 overflow-hidden
          transition-all duration-300 ease-out
          group-hover:px-4 group-hover:border-primary group-hover:bg-primary/5
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer group-hover:shadow-md'}`}
        style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
      >
        {direction === "left" && (
          <ChevronLeft 
            className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors flex-shrink-0" 
            strokeWidth={2.5}
          />
        )}
        
        {/* Text that appears on hover */}
        <span 
          className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold text-primary
            transition-all duration-300 ease-out opacity-0
            group-hover:max-w-24 group-hover:opacity-100 group-hover:mx-1"
        >
          {label}
        </span>
        
        {direction === "right" && (
          <ChevronRight 
            className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors flex-shrink-0" 
            strokeWidth={2.5}
          />
        )}
      </div>
    </button>
  );
};
