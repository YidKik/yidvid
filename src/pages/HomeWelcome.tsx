import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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
    </div>
  );
}
