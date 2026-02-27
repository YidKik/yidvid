import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Play } from 'lucide-react';
import { AnimatedPlayLogo } from './AnimatedPlayLogo';
import { useNavigate } from 'react-router-dom';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';

const typingPhrases = [
  "Find inspiring Torah videos...",
  "Discover new Jewish music...",
  "Search for your favorite channels...",
  "Watch entertainment for the family...",
  "Explore educational content...",
  "Listen to the latest podcasts...",
];

const HeroSearchSection = () => {
  const navigate = useNavigate();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { suggestions, isLoading } = useSearchSuggestions();

  useEffect(() => {
    if (suggestions.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  const currentPlaceholder = suggestions[currentSuggestionIndex]?.name || 'Search videos, channels...';

  const handleInputClick = () => {
    if (!searchQuery && suggestions[currentSuggestionIndex]) {
      setSearchQuery(suggestions[currentSuggestionIndex].name);
    }
  };

  useEffect(() => {
    const currentPhrase = typingPhrases[currentPhraseIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, 60);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
      } else {
        setCurrentPhraseIndex((prev) => (prev + 1) % typingPhrases.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentPhraseIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 pt-32 pb-20">
      {/* Background decoration - subtle, kept for landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.07]"
          style={{ backgroundColor: '#FF0000' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-[0.05]"
          style={{ backgroundColor: '#FFCC00' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mx-auto w-full"
      >
        <AnimatedPlayLogo className="w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 mx-auto mb-10" />

        {/* Typing Text */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 
            className="text-3xl md:text-5xl lg:text-6xl font-semibold min-h-[70px] md:min-h-[90px] flex items-center justify-center whitespace-nowrap"
            style={{ fontFamily: "'Nunito', 'Poppins', sans-serif", color: '#1A1A1A', letterSpacing: '-0.01em' }}
          >
            <span>{displayText}</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="ml-1 inline-block w-[3px] h-[1em] align-middle bg-[#FF0000]"
            />
          </h1>
        </motion.div>

        {/* Search Box */}
        <motion.form
          onSubmit={handleSearch}
          className="w-full max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div 
            className="relative flex items-center rounded-full shadow-xl overflow-hidden border-2 transition-all duration-300 focus-within:shadow-2xl border-[#E5E5E5] focus-within:border-[#FFCC00] bg-white"
          >
            <Search 
              className="absolute left-5 w-6 h-6 z-10"
              style={{ color: '#999999' }}
            />
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={handleInputClick}
                className="w-full py-5 pl-14 pr-36 text-lg outline-none bg-transparent cursor-text"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: '#1A1A1A'
                }}
              />
              {/* Animated placeholder */}
              {!searchQuery && !isLoading && suggestions.length > 0 && (
                <div className="absolute inset-0 flex items-center pl-14 pr-36 pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentSuggestionIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ 
                        fontFamily: "'Quicksand', sans-serif",
                        color: '#999999',
                        fontSize: '1.125rem'
                      }}
                    >
                      {currentPlaceholder}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
            </div>
            <motion.button
              type="submit"
              className="absolute right-2 z-20 flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors cursor-pointer bg-[#FF0000] text-white"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              whileHover={{ filter: 'brightness(0.9)' }}
              whileTap={{ scale: 0.95 }}
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.form>

        {/* Browse videos button */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.button
            onClick={() => navigate('/videos')}
            className="group flex items-center gap-3 px-8 py-4 rounded-full font-semibold transition-all duration-300 bg-white border border-[#E5E5E5]"
            style={{ 
              fontFamily: "'Quicksand', sans-serif",
              color: '#1A1A1A',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
            whileHover={{ 
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              scale: 1.02
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: '#FF0000' }} />
            <span>Browse All Videos</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" style={{ color: '#FF0000' }} />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSearchSection;
