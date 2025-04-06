
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
          src="/lovable-uploads/10b6d1cf-735e-4723-92e8-bea5eb9375a3.png" 
          alt={direction === "left" ? "Previous Page" : "Next Page"}
          className={`w-10 h-10 object-contain transform ${direction === "left" ? "rotate-0" : "rotate-0"}`}
          style={{
            clipPath: direction === "left" 
              ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' 
              : 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
          }}
        />
      </div>
    </button>
  );
};
