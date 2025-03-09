
import React from "react";

interface RefreshContentButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export const RefreshContentButton: React.FC<RefreshContentButtonProps> = ({
  onClick,
  label = "Refresh Content",
  className = ""
}) => {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${className}`}
    >
      {label}
    </button>
  );
};
