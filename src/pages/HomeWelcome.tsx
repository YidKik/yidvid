
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { VideoCarouselRows } from "@/components/welcome/VideoCarouselRows";

// Friendly single-hue gradients: top (lighter) to bottom (deeper)
// Use YidVid palette: red, purple, soft yellow, lavender tones
const brandGradients = [
  // Warm Red
  "linear-gradient(to bottom, #fecdd3 0%, #ea384c 100%)",
  // Brand Purple
  "linear-gradient(to bottom, #ede9fe 0%, #9b87f5 100%)",
  // Happy Soft Yellow
  "linear-gradient(to bottom, #fff7d6 0%, #ffe29f 100%)",
  // Light Lavender
  "linear-gradient(to bottom, #f3e8ff 0%, #d6bcfa 100%)",
];

export default function HomeWelcome() {
  const navigate = useNavigate();
  const [gradientIndex, setGradientIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  // Ultra-smooth, longer cycle (18s), super gentle cross-fade
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((i) => (i + 1) % brandGradients.length);
      setFadeKey((k) => k + 1); // force re-mount for AnimatePresence fade
    }, 18000); // 18 seconds per color
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
      {/* Background gradient with ultra-smooth cross-fade */}
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

      {/* Floating decorative blobs */}
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

      {/* Center hero section */}
      <div className="relative z-20 flex flex-col items-center pt-24">
        <motion.img
          src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
          alt="YidVid Logo"
          className="w-24 h-24 mb-4 shadow-2xl rounded-full border-4 border-primary bg-white/60"
          initial={{ rotate: -10, scale: 0.75, opacity: 0.7 }}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [0.75, 1.1, 1],
            opacity: 1
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        />
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-pink-400 py-2 mb-4"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Welcome to YidVid
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl text-black/80 text-center max-w-2xl mb-8 font-semibold"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.9 }}
        >
          The friendly Jewish video platform. Explore, discover, be inspired – all in one place with vibrant effects and a professional feel.
        </motion.p>

        <motion.div
          className="flex gap-4 mt-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1.1 }}
        >
          <Button
            onClick={() => navigate("/videos")}
            className="text-xl py-5 px-8 bg-primary shadow-xl hover:bg-accent hover:scale-105 transition-all flex items-center gap-2"
            size="lg"
          >
            <Play className="h-5 w-5" />
            Explore Videos
          </Button>
        </motion.div>
      </div>

      {/* Video carousel grid rows background */}
      <VideoCarouselRows />
    </div>
  );
}

