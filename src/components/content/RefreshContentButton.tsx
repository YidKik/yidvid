
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshContentButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  isRefreshing?: boolean;
}

export const RefreshContentButton: React.FC<RefreshContentButtonProps> = ({
  onClick,
  label = "Refresh Content",
  className = "",
  disabled = false,
  isRefreshing = false
}) => {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled}
      className={`text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-1 px-3 rounded flex items-center gap-2 ${className}`}
    >
      <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
      {isRefreshing ? "Refreshing..." : label}
    </Button>
  );
};
