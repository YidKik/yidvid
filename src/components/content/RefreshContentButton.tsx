
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

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
    <Button 
      onClick={onClick}
      className={`px-4 py-2 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white border border-gray-700 rounded-md shadow-md transition-all duration-300 ${className}`}
    >
      <RefreshCcw className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};
