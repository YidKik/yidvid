
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Video, GalleryHorizontal, Star } from "lucide-react";

const coolGradients = [
  "linear-gradient(102.3deg, #93278f 5.9%, #eaace8 64%, #f6dbf5 89%)",
  "linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)",
  "linear-gradient(60deg, #abecd6 0%, #fbed96 100%)"
];

export default function HomeWelcome() {
  const navigate = useNavigate();
  const [gradientIndex, setGradientIndex] = useState(0);

  // Cycle background gradients every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((i) => (i + 1) % coolGradients.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { label: "Vibrant Jewish Videos", icon: <Video className="text-primary h-5 w-5" /> },
    { label: "Curated Channels", icon: <GalleryHorizontal className="text-accent h-5 w-5" /> },
    { label: "Friendly Community", icon: <Star className="text-yellow-400 h-5 w-5" /> },
  ];

  return (
    <div 
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: coolGradients[gradientIndex],
        transition: "background 2s linear"
      }}
    >
      {/* Animated floating blobs */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full shadow-xl opacity-20 blur-2xl"
          style={{
            width: `${80 + (i%3)*60}px`,
            height: `${80 + (i%3)*70}px`,
            background: i % 2 === 0 ? "#9b87f5" : "#efca5adf",
            top: `${Math.abs(Math.sin(i)*80) + (i*12)}%`,
            left: `${Math.abs(Math.cos(i*2)*70) + (i*9)}%`,
          }}
          initial={{ scale: 0.6, opacity: 0.1 }}
          animate={{ 
            scale: [0.7, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            y: [0, 30*(i%4), -40*(i%3), 0]
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}

      {/* Animated Welcome Block */}
      <AnimatePresence>
        <motion.div 
          key="welcome"
          className="relative z-10 flex flex-col items-center p-8 rounded-3xl shadow-2xl glassy"
          initial={{ scale: 0.98, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          {/* Logo animation */}
          <motion.img
            src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
            alt="YidVid Logo"
            className="w-24 h-24 mb-4 drop-shadow-lg rounded-full border-4 border-primary"
            initial={{ rotate: -10, scale: 0.75, opacity: 0.8 }}
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
            className="text-lg md:text-2xl text-white text-center max-w-2xl mb-6 font-semibold"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.9 }}
          >
            Chill out, explore, and enjoy the friendliest Jewish video platform with mesmerizing visuals and non-stop effects!
          </motion.p>

          {/* Squiggly divider animation */}
          <motion.div 
            className="w-44 h-4 mt-2 mb-8 relative"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{
              scale: [0.95, 1.1, 1],
              opacity: [0, 1, 0.8, 1]
            }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.2 }}
          >
            <svg width="180" height="23" viewBox="0 0 180 23" fill="none">
              <path
                d="M3 10c30-22 37 22 60 0s40 22 60 0 37 22 54 0"
                stroke="#9b87f5" strokeWidth="3" fill="none"
              />
            </svg>
          </motion.div>

          {/* Feature highlights - animated */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 mt-1">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                className="flex items-center gap-3 px-5 py-3 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 shadow"
                initial={{ opacity: 0, x: -40 + i*20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{delay: 1.5 + i*0.13, duration: 0.9}}
              >
                <span>{f.icon}</span>
                <span className="text-xl font-medium text-white">{f.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Main CTAs */}
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
        </motion.div>
      </AnimatePresence>

      {/* Bottom shimmer prompt to scroll */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0,1,1,0], y: [20,0,0,20] }}
        transition={{ delay: 3.2, duration: 4.5, repeat: Infinity }}
      >
        <span className="text-white text-base font-semibold bg-black/20 px-4 py-1 rounded-lg shadow">
          Relax and look around...
        </span>
        <motion.div
          className="w-10 h-10 mt-2 rounded-full bg-primary/30 flex items-center justify-center animate-bounce"
        >
          <svg width="18" height="22" fill="currentColor" className="text-white opacity-60">
            <path d="M9 2v15m0 0-7-7m7 7 7-7" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
