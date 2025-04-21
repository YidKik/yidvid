
import { motion } from "framer-motion";

export const LogoAnimation = () => {
  // Generate sparkles for the logo
  const sparkles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    scale: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="relative w-60 h-60 mx-auto mb-8">
      {/* Sparkles around the logo */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full"
          style={{ x: sparkle.x, y: sparkle.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, sparkle.scale, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2 + 1,
          }}
        />
      ))}

      {/* Pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0, 0.2, 0],
          scale: [0.8, 1.4, 1.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
        style={{
          background: "radial-gradient(circle, rgba(234,56,76,0.3) 0%, rgba(234,56,76,0) 70%)",
        }}
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.2
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Rotating inner circle */}
        <motion.div
          className="absolute w-full h-full rounded-full"
          style={{
            background: "conic-gradient(from 0deg, rgba(234,56,76,0.05), rgba(234,56,76,0.2), rgba(234,56,76,0.05))",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Complete Logo */}
        <motion.img
          src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
          alt="YidVid Logo"
          className="w-full h-full object-contain z-10 drop-shadow-md"
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: 0.3
          }}
          onError={(e) => {
            console.error('Animation logo failed to load:', e);
            // Fallback to the alternative logo format
            e.currentTarget.src = "/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png";
          }}
        />
        
        {/* Pulsing background effect */}
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ 
            scale: [1.2, 1],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute inset-0 rounded-full -z-10 bg-gradient-to-br from-primary/10 to-white/80"
        />
      </motion.div>
    </div>
  );
};
