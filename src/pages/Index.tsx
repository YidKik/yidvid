
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomeLeftDiagonalFade from "@/components/welcome/HomeLeftDiagonalFade";
import { VideoRows } from "@/components/welcome/VideoRows";
import { WelcomeHeader } from "@/components/welcome/WelcomeHeader";

const brandGradients = [
  "linear-gradient(to bottom, #fecdd3 0%, #ea384c 100%)",
  "linear-gradient(to bottom, #ede9fe 0%, #9b87f5 100%)",
  "linear-gradient(to bottom, #fff7d6 0%, #ffe29f 100%)",
  "linear-gradient(to bottom, #f3e8ff 0%, #d6bcfa 100%)",
];

export default function Index() {
  const [gradientIndex, setGradientIndex] = React.useState(0);
  const [fadeKey, setFadeKey] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((i) => (i + 1) % brandGradients.length);
      setFadeKey((k) => k + 1);
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden overflow-y-auto bg-transparent">
      {/* Animated gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={fadeKey + "-" + gradientIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3.5 }}
          className="absolute inset-0 -z-10"
          style={{
            background: brandGradients[gradientIndex],
            transition: "background 2.7s linear",
          }}
        />
      </AnimatePresence>
      
      {/* Content container with proper z-indexing */}
      <div className="relative w-full flex-1">
        {/* Diagonal (angled) fade overlay (positioned on top) */}
        <HomeLeftDiagonalFade />
        
        {/* Welcome header (positioned on top of diagonal fade) */}
        <div className="relative z-[51] pt-8 md:pt-16 px-6 md:px-12 lg:px-16">
          <WelcomeHeader />
        </div>
        
        {/* "Welcome to edit" debug message overlay on the left side */}
        <div 
          className="pointer-events-none absolute top-20 left-4 z-[9999] bg-yellow-400 text-black px-4 py-2 rounded shadow-lg select-none"
        >
          Welcome to edit
        </div>

        {/* Video rows (positioned below in z-index) */}
        <div className="relative z-20 mt-32 md:mt-40 lg:mt-48">
          <VideoRows />
        </div>
      </div>
    </div>
  );
}
