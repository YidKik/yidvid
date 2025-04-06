
import React from "react";

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
      className={`p-2 hover:scale-110 transition-all duration-300 focus:outline-none ${className}`}
      aria-label={direction === "left" ? "Previous page" : "Next page"}
    >
      <div className={`flex justify-center items-center ${
        disabled ? 'opacity-50' : 'opacity-100'
      }`}>
        <img 
          src="/lovable-uploads/a470b64a-63ad-40c1-9ffb-7811fc5bb966.png" 
          alt={direction === "left" ? "Previous Page" : "Next Page"}
          className={`w-10 h-10 object-contain transform ${direction === "left" ? "rotate-180" : ""}`}
        />
      </div>
    </button>
  );
};
