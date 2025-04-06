
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
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 40 40" 
          xmlns="http://www.w3.org/2000/svg"
          className={`transform ${direction === "left" ? "rotate-180" : ""}`}
        >
          <circle cx="20" cy="20" r="19" stroke="#ea384c" strokeWidth="1" fill="none" />
          <path d="M15 20L25 12.5V27.5L15 20Z" fill="#ea384c" />
        </svg>
      </div>
    </button>
  );
};
