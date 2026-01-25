import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Search, ArrowRight, ArrowDown, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import yidvidLogoIcon from '@/assets/yidvid-logo-icon.png';
import AnimatedShapes from './AnimatedShapes';
import TypewriterText from './TypewriterText';

interface FullScreenHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  suggestions: { name: string }[];
  currentSuggestionIndex: number;
}

const FullScreenHero: React.FC<FullScreenHeroProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  suggestions,
  currentSuggestionIndex,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax effects for hero content
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  
  const smoothY = useSpring(heroY, { stiffness: 100, damping: 30 });
  const smoothOpacity = useSpring(heroOpacity, { stiffness: 100, damping: 30 });
  const smoothScale = useSpring(heroScale, { stiffness: 100, damping: 30 });

  const currentPlaceholder = suggestions[currentSuggestionIndex]?.name || 'Search videos, channels...';

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#fafafa' }}
    >
      {/* Animated background shapes */}
      <AnimatedShapes />

      {/* Main hero content */}
      <motion.div
        style={{
          y: smoothY,
          opacity: smoothOpacity,
          scale: smoothScale,
        }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6"
      >
        {/* Logo with entrance animation */}
        <motion.img
          src={yidvidLogoIcon}
          alt="YidVid Logo"
          className="w-32 h-32 md:w-44 md:h-44 mb-8 drop-shadow-2xl"
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            delay: 0.2,
            duration: 1 
          }}
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.5 }
          }}
        />

        {/* Typewriter text */}
        <TypewriterText />

        {/* Search box with glass effect */}
        <motion.form
          onSubmit={onSearch}
          className="w-full max-w-2xl mx-auto mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div
            className="relative flex items-center rounded-full overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 0, 0, 0.2)',
            }}
            whileHover={{
              boxShadow: '0 20px 60px rgba(255, 0, 0, 0.15)',
              borderColor: 'rgba(255, 0, 0, 0.4)',
            }}
            transition={{ duration: 0.3 }}
          >
            <Search className="absolute left-5 w-6 h-6 text-gray-400 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentPlaceholder}
              className="w-full py-5 pl-14 pr-36 text-lg outline-none bg-transparent"
              style={{
                fontFamily: "'Quicksand', sans-serif",
                color: '#1a1a1a',
              }}
            />
            <motion.button
              type="submit"
              className="absolute right-2 flex items-center gap-2 px-6 py-3 rounded-full font-bold"
              style={{
                fontFamily: "'Quicksand', sans-serif",
                backgroundColor: 'hsl(0, 100%, 50%)',
                color: 'white',
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'hsl(0, 100%, 45%)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Browse button */}
        <motion.button
          onClick={() => navigate('/videos')}
          className="mt-6 group flex items-center gap-3 px-8 py-4 rounded-full font-semibold"
          style={{
            fontFamily: "'Quicksand', sans-serif",
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="w-5 h-5" style={{ color: 'hsl(0, 100%, 50%)' }} />
          <span>Browse All Videos</span>
          <ArrowRight 
            className="w-4 h-4 transition-transform group-hover:translate-x-1" 
            style={{ color: 'hsl(0, 100%, 50%)' }} 
          />
        </motion.button>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span 
            className="text-sm font-medium"
            style={{ color: '#666', fontFamily: "'Quicksand', sans-serif" }}
          >
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="w-5 h-5" style={{ color: 'hsl(0, 100%, 50%)' }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FullScreenHero;
