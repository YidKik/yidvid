
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryLabelProps {
  label: string;
  textColor: string;
}

export const CategoryLabel = ({ label, textColor }: CategoryLabelProps) => {
  const isMobile = useIsMobile();

  // Adjust font size for long words
  const getAdjustedFontSize = (text: string) => {
    if (!isMobile) return {};
    
    // Reduce font size for long category names
    if (text === "Entertainment" || text.length > 11) {
      return { fontSize: '9px', letterSpacing: '-0.02em' };
    } else if (text.length > 8) {
      return { fontSize: '10px', letterSpacing: '-0.01em' };
    }
    
    return {};
  };

  return (
    <h3 
      className={`font-medium text-[11px] leading-tight md:text-sm tracking-tight line-clamp-2 ${isMobile ? 'max-w-[85px]' : 'max-w-[120px]'}`}
      style={{ 
        color: textColor,
        textShadow: '0 0 1px rgba(255,255,255,0.5)',
        fontWeight: 600,
        ...getAdjustedFontSize(label)
      }}
    >
      {label}
    </h3>
  );
};
