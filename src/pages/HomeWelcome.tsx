
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { VideoCarouselRows } from "@/components/welcome/VideoCarouselRows";

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

      {/* Centered large static YidVid logo with blur underneath */}
      <div className="flex-1 flex flex-col items-center justify-center pt-12 pb-4 relative z-20 min-h-[500px]">
        {/* Blur effect div positioned absolutely under the logo */}
        <div
          className="
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            w-[390px] h-[170px] rounded-full
            bg-[#f1f1f1]/60 blur-2xl z-0
            pointer-events-none
          "
          style={{
            filter: "blur(28px)",
            opacity: 0.88,
            // Responsive scaling for mobile
            maxWidth: "92vw"
          }}
        />
        <img
          src="/lovable-uploads/be2a7abc-dfab-4472-9970-5d7df617545f.png"
          alt="YidVid Logo"
          className="w-[380px] max-w-[92vw] h-auto mb-2 mx-auto relative z-10 select-none"
          draggable={false}
        />
      </div>

      <div className="w-full h-[600px] relative pointer-events-none z-10">
        <VideoCarouselRows />
      </div>

      <div className="h-[155vh]" />
    </div>
  );
}
