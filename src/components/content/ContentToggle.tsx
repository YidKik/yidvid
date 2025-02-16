
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContentToggleProps {
  isMusic: boolean;
  onToggle: () => void;
}

export const ContentToggle = ({ isMusic, onToggle }: ContentToggleProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-center w-full mb-4">
      <div 
        className="relative w-[180px] md:w-[240px] h-8 md:h-12 bg-gray-100 rounded-full p-1 md:p-1.5 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        onClick={onToggle}
      >
        <div className="relative w-full h-full flex items-center justify-between px-4 md:px-8 text-xs md:text-sm font-medium">
          <span className={`z-10 transition-colors duration-200 ${!isMusic ? 'text-white' : 'text-gray-600'}`}>
            Videos
          </span>
          <span className={`z-10 transition-colors duration-200 ${isMusic ? 'text-white' : 'text-gray-600'}`}>
            Music
          </span>
          <motion.div
            className="absolute top-0 left-0 w-[82px] md:w-[108px] h-full bg-primary rounded-full"
            animate={{
              x: isMusic ? (isMobile ? 94 : 128) : 2
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
