
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
      className={`focus:outline-none group ${className}`}
      aria-label={direction === "left" ? "Previous page" : "Next page"}
    >
      <div 
        className={`flex justify-center items-center rounded-full 
          border border-highlight bg-transparent
          h-11 px-4 overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          group-hover:px-5 group-hover:bg-highlight/10
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{ 
          fontFamily: "'Quicksand', 'Rubik', sans-serif",
          borderColor: 'hsl(50, 100%, 50%)'
        }}
      >
        {direction === "left" && (
          <ChevronLeft 
            className="w-5 h-5 flex-shrink-0" 
            strokeWidth={2.5}
            style={{ color: 'hsl(50, 100%, 45%)' }}
          />
        )}
        
        {/* Text that appears on hover */}
        <span 
          className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold
            transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] opacity-0
            group-hover:max-w-28 group-hover:opacity-100 group-hover:mx-1.5"
          style={{ color: 'hsl(50, 100%, 40%)' }}
        >
          {label}
        </span>
        
        {direction === "right" && (
          <ChevronRight 
            className="w-5 h-5 flex-shrink-0" 
            strokeWidth={2.5}
            style={{ color: 'hsl(50, 100%, 45%)' }}
          />
        )}
      </div>
    </button>
  );
};
