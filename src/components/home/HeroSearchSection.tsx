import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
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

  // Rotate search suggestions every 3 seconds
  useEffect(() => {
    if (suggestions.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  const currentPlaceholder = suggestions[currentSuggestionIndex]?.name || 'Search videos, channels...';

  // Handle click on the search input to fill with current suggestion
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
      navigate(`/videos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: 'hsl(0, 100%, 50%)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: 'hsl(50, 100%, 50%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mx-auto w-full"
      >
        {/* Logo */}
        <motion.img
          src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
          alt="YidVid Logo"
          className="w-20 h-20 mx-auto mb-8 drop-shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        />

        {/* Typing Text */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 
            className="text-2xl md:text-4xl lg:text-5xl font-semibold min-h-[60px] md:min-h-[70px] flex items-center justify-center whitespace-nowrap"
            style={{ fontFamily: "'Nunito', 'Poppins', sans-serif", color: '#1a1a1a', letterSpacing: '-0.01em' }}
          >
            <span>{displayText}</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="ml-1 inline-block w-[3px] h-[1em] align-middle"
              style={{ backgroundColor: 'hsl(0, 100%, 50%)' }}
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
            className="relative flex items-center rounded-full shadow-xl overflow-hidden border-2 transition-all duration-300 focus-within:shadow-2xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 0, 0, 0.3)'
            }}
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
                className="w-full py-5 pl-14 pr-36 text-lg outline-none bg-transparent relative z-10 cursor-text"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: '#1a1a1a'
                }}
              />
              {/* Animated placeholder */}
              {!searchQuery && !isLoading && suggestions.length > 0 && (
                <div className="absolute inset-0 flex items-center pl-14 pointer-events-none">
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
              className="absolute right-2 flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                backgroundColor: 'hsl(0, 100%, 50%)',
                color: 'white'
              }}
              whileHover={{ backgroundColor: 'hsl(0, 100%, 45%)' }}
              whileTap={{ scale: 0.95 }}
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.form>

      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 1.2 },
          y: { repeat: Infinity, duration: 1.5 }
        }}
      >
        <div 
          className="w-6 h-10 rounded-full flex justify-center pt-2"
          style={{ border: '2px solid rgba(0, 0, 0, 0.2)' }}
        >
          <div 
            className="w-1.5 h-3 rounded-full"
            style={{ backgroundColor: 'hsl(0, 100%, 50%)' }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSearchSection;
