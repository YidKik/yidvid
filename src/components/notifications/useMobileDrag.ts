
import { useRef, useState } from "react";

export const useMobileDrag = (onClose: () => void, isMobile: boolean) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const sheetContentRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      setIsDragging(true);
      setDragStartY(e.touches[0].clientY);
      setDragCurrentY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isMobile && isDragging) {
      setDragCurrentY(e.touches[0].clientY);
      
      // Only allow dragging downward
      const dragDistance = dragCurrentY - dragStartY;
      if (dragDistance > 0 && sheetContentRef.current) {
        // Apply transform to the sheet as user drags
        sheetContentRef.current.style.transform = `translateY(${dragDistance}px)`;
        sheetContentRef.current.style.transition = 'none';
      }
    }
  };

  const handleTouchEnd = () => {
    if (isMobile && isDragging && sheetContentRef.current) {
      const dragDistance = dragCurrentY - dragStartY;
      
      // If dragged down more than 100px, close the sheet
      if (dragDistance > 100) {
        onClose();
      }
      
      // Reset the transform
      sheetContentRef.current.style.transform = '';
      sheetContentRef.current.style.transition = 'transform 0.3s ease-out';
    }
    
    setIsDragging(false);
  };

  return {
    sheetContentRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
