
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { VideoCarouselRows } from "@/components/welcome/VideoCarouselRows";
import WelcomeTopShape from "@/components/welcome/WelcomeTopShape";

// Brand background gradients (keep as before)
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
            transition: "background 2.7s linear",
          }}
        />
      </AnimatePresence>

      {/* Subtle animated orb shapes for a lively feel (unchanged) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full shadow-xl opacity-10 blur-2xl pointer-events-none"
          style={{
            width: `${80 + (i%3)*54}px`,
            height: `${80 + (i%3)*58}px`,
            background: i % 2 === 0 ? "#9b87f5" : "#efca5a99",
            top: `${10 + Math.abs(Math.sin(i)*66) + (i*5)}%`,
            left: `${10 + Math.abs(Math.cos(i*2)*42) + (i*12)}%`,
          }}
          initial={{ scale: 0.67, opacity: 0.08 }}
          animate={{
            scale: [0.89, 1.18, 0.88],
            opacity: [0.13, 0.17, 0.09],
            y: [0, 18*(i%4), -28*(i%3), 0]
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}

      {/* Overlay top-right fade shape above videos */}
      <WelcomeTopShape />

      {/* PLACE VIDEO CAROUSEL SECTION AT THE TOP */}
      <div className="w-full relative z-0" style={{ marginTop: "0" }}>
        <VideoCarouselRows />
      </div>

      {/* HERO SECTION: logo and message remain as-is, just beneath carousel */}
      <div className="relative w-full flex flex-row items-start md:items-center pt-7 pb-2" style={{ minHeight: "44vh", zIndex: 20 }}>
        {/* Left: Logo & Welcome Message */}
        <div className="ml-[clamp(1rem,9vw,7rem)] mt-6 flex flex-col items-start justify-center z-20" style={{ maxWidth: 510 }}>
          <div className="flex flex-row items-center gap-4 mb-3">
            <img
              src="/lovable-uploads/be2a7abc-dfab-4472-9970-5d7df617545f.png"
              alt="YidVid Logo"
              className="h-[62px] md:h-[74px] w-auto drop-shadow-xl"
              draggable={false}
            />
            <span className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight select-none" style={{ fontFamily: "Nunito, Lato, Arial" }}>
              YidVid
            </span>
          </div>
          <div className="mt-1 md:mt-2 bg-transparent rounded-lg px-0 py-0 shadow-none w-full">
            <h1 className="text-[2.0rem] md:text-3xl font-bold text-left mb-1 tracking-tight text-[#d0263f]">
              Welcome to YidVid
            </h1>
            <p className="text-[1.18rem] md:text-xl font-medium text-gray-600" style={{ maxWidth: 410 }}>
              Your gateway to curated Jewish content.<br />
              Discover videos that inspire, entertain, and connect.
            </p>
          </div>
        </div>
        {/* Right side intentionally left empty for overlapping shape/carousel */}
      </div>

      {/* Remove extra space below carousel */}
      {/* <div className="h-[43vh]" /> */}
    </div>
  );
}
