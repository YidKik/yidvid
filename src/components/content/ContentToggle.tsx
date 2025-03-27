
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ContentToggleProps {
  isMusic: boolean;
  onToggle: () => void;
}

export const ContentToggle = ({ isMusic, onToggle }: ContentToggleProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-center w-full mb-2 md:mb-4 mt-2 md:mt-4">
      <div 
        className={`
          relative
          ${isMobile ? 'w-[140px] h-8 rounded-full p-0.5' : 'w-[240px] h-12 rounded-full p-1.5'}
          bg-white
          cursor-pointer
          shadow-md hover:shadow-lg
          transition-all duration-200
        `}
        onClick={onToggle}
      >
        <div className="relative w-full h-full flex items-center justify-between px-3 md:px-8 text-xs md:text-base font-medium">
          <span className={`z-10 transition-colors duration-200 ${!isMusic ? 'text-white' : 'text-gray-600'}`}>
            Videos
          </span>
          <span className={`z-10 transition-colors duration-200 ${isMusic ? 'text-white' : 'text-gray-600'}`}>
            Music
          </span>
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-sm"
            animate={{
              x: isMusic ? (isMobile ? 73 : 128) : 2,
              width: isMobile ? "62px" : "108px"
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          />
        </div>
      </div>
    </div>
  );
};
