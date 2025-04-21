
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { VideoCarouselRows } from "@/components/welcome/VideoCarouselRows";

// Brand background gradients
const brandGradients = [
  "linear-gradient(to bottom, #fecdd3 0%, #ea384c 100%)",
  "linear-gradient(to bottom, #ede9fe 0%, #9b87f5 100%)",
  "linear-gradient(to bottom, #fff7d6 0%, #ffe29f 100%)",
  "linear-gradient(to bottom, #f3e8ff 0%, #d6bcfa 100%)",
];

export default function HomeWelcome() {
  const [gradientIndex, setGradientIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((i) => (i + 1) % brandGradients.length);
      setFadeKey((k) => k + 1);
    }, 18000);

    return () => clearInterval(interval);
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

      {/* Animated "orb" floating shapes */}
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

      {/* Top main hero area */}
      <div className="relative flex-1 w-full flex flex-row items-center" style={{ minHeight: '50vh' }}>
        <div className="flex-1 flex flex-col items-start justify-center pl-[clamp(1rem,18vw,11rem)] z-20">
          {/* Hero logo row */}
          <div className="flex flex-row items-center gap-3 md:gap-6 mb-2">
            <img
              src="/lovable-uploads/be2a7abc-dfab-4472-9970-5d7df617545f.png"
              alt="YidVid Logo"
              className="h-[78px] md:h-[98px] w-auto drop-shadow-xl"
              draggable={false}
            />
            <span className="text-5xl md:text-6xl font-extrabold text-gray-800 tracking-tight select-none" style={{ fontFamily: "Nunito, Lato, Arial" }}>YidVid</span>
          </div>

          {/* Welcome card */}
          <motion.div
            className="bg-white/70 backdrop-blur-md rounded-2xl p-7 px-10 shadow-2xl max-w-xl mt-0"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 tracking-tight">
              <span className="text-[#e52d49]">Welcome to</span> <span className="text-gray-900">YidVid</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 text-center">
              Your gateway to curated Jewish content.<br />
              Discover videos that inspire, entertain, and connect.
            </p>
          </motion.div>
        </div>

        {/* Diagonal highlight shape */}
        <div
          className="hidden md:block absolute top-0 right-0 h-[92vh] w-[63vw] z-10 pointer-events-none"
          style={{ minWidth: 480 }}
          aria-hidden="true"
        >
          <svg width="100%" height="100%" viewBox="0 0 550 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="highlight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.68"/>
                <stop offset="88%" stopColor="#fff" stopOpacity="0.09"/>
              </linearGradient>
              <filter id="glow" x="-30%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="43" />
              </filter>
            </defs>
            <path
              d="M80 38 Q470 190 545 120 Q600 260 530 800 L0 800 L0 0 Q38 48 80 38 Z"
              fill="url(#highlight)"
              filter="url(#glow)"
            />
          </svg>
        </div>
      </div>

      {/* Absolute video carousel overlay lower down, but still visible */}
      <div className="w-full min-h-[550px] h-[56vh] relative z-30" style={{ marginTop: "-88px" }}>
        <VideoCarouselRows />
      </div>

      {/* Extra space for vertical scrolling */}
      <div className="h-[155vh]" />
    </div>
  );
}
