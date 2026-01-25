import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const typingPhrases = [
  "Find inspiring Torah videos...",
  "Discover new Jewish music...",
  "Search for your favorite channels...",
  "Watch entertainment for the family...",
  "Explore educational content...",
  "Listen to the latest podcasts...",
];

const TypewriterText: React.FC = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-center"
    >
      <h1
        className="text-3xl md:text-5xl lg:text-6xl font-semibold min-h-[70px] md:min-h-[90px] flex items-center justify-center"
        style={{
          fontFamily: "'Nunito', 'Poppins', sans-serif",
          color: '#1a1a1a',
          letterSpacing: '-0.01em',
        }}
      >
        <span>{displayText}</span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="ml-1 inline-block w-[3px] h-[1em] align-middle"
          style={{ backgroundColor: 'hsl(0, 100%, 50%)' }}
        />
      </h1>
    </motion.div>
  );
};

export default TypewriterText;
