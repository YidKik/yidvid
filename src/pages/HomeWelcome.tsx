
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { VideoCarouselRows } from "@/components/welcome/VideoCarouselRows";
import { HomeVideoShowcase } from "@/components/welcome/HomeVideoShowcase";

const brandGradients = [
  "linear-gradient(to bottom, #fecdd3 0%, #ea384c 100%)",
  "linear-gradient(to bottom, #ede9fe 0%, #9b87f5 100%)",
  "linear-gradient(to bottom, #fff7d6 0%, #ffe29f 100%)",
  "linear-gradient(to bottom, #f3e8ff 0%, #d6bcfa 100%)",
];

export default function HomeWelcome() {
  const [gradientIndex, setGradientIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((i) => (i + 1) % brandGradients.length);
      setFadeKey((k) => k + 1);
    }, 18000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden overflow-y-auto bg-transparent">
      {/* Animated background gradient */}
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
            transition: "background 2.7s linear"
          }}
        />
      </AnimatePresence>

      {/* Animated floating elements */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full shadow-xl opacity-15 blur-2xl pointer-events-none"
          style={{
            width: `${80 + (i%3)*60}px`,
            height: `${80 + (i%3)*70}px`,
            background: i % 2 === 0 ? "#9b87f5" : "#efca5adf",
            top: `${Math.abs(Math.sin(i)*80) + (i*12)}%`,
            left: `${Math.abs(Math.cos(i*2)*70) + (i*9)}%`,
          }}
          initial={{ scale: 0.6, opacity: 0.08 }}
          animate={{
            scale: [0.77, 1.13, 1],
            opacity: [0.09, 0.18, 0.13],
            y: [0, 30*(i%4), -40*(i%3), 0]
          }}
          transition={{
            duration: 12 + i * 3.5,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}

      {/* Hero section with centered logo */}
      <div className="flex-1 flex flex-col items-center justify-center pt-12 pb-4 relative z-20 min-h-[500px]">
        {/* Subtle glow effect behind the logo */}
        <div
          className="
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            w-[700px] h-[300px] rounded-full
            pointer-events-none
            z-0
          "
          style={{
            background: "rgba(142, 145, 150, 0.38)",
            filter: "blur(44px)",
            opacity: 0.97,
            maxWidth: "97vw"
          }}
        />
        
        {/* Main logo */}
        <motion.img
          src="/lovable-uploads/be2a7abc-dfab-4472-9970-5d7df617545f.png"
          alt="YidVid Logo"
          className="w-[420px] max-w-[97vw] h-auto mb-2 mx-auto relative z-10 select-none"
          initial={{ scale: 0.9, y: -10, opacity: 0 }}
          animate={{ 
            scale: 1,
            y: 0,
            opacity: 1,
          }}
          transition={{ 
            duration: 1.2, 
            delay: 0.2,
            ease: "easeOut" 
          }}
          draggable={false}
        />
        
        {/* Welcome text */}
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Welcome to YidVid
          </h1>
          <p className="text-xl text-slate-700 max-w-[600px] mx-auto px-4">
            Your gateway to curated Jewish content. Discover videos that inspire, entertain, and connect.
          </p>
        </motion.div>
        
        {/* Scroll down indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: scrolled ? 0 : [0, 1, 0.7],
            y: scrolled ? 10 : [0, 10, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <p className="text-sm text-slate-600 mb-2">Scroll to explore</p>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-bounce"
          >
            <path
              d="M12 5V19M12 19L19 12M12 19L5 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* Video carousel section */}
      <div className="w-full h-[600px] relative pointer-events-none z-10">
        <VideoCarouselRows />
      </div>

      {/* Extra space to allow scrolling */}
      <div className="h-[155vh]" />
    </div>
  );
}
