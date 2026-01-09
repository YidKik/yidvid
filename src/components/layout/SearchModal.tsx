import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const typingPhrases = [
  "Search for videos...",
  "Find your favorite channels...",
  "Discover Torah content...",
  "Explore Jewish music...",
  "Watch inspiring lectures...",
];

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typingText, setTypingText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Typing animation effect
  useEffect(() => {
    if (!isOpen) return;

    const currentPhrase = typingPhrases[phraseIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setTypingText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Wait before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setTypingText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((phraseIndex + 1) % typingPhrases.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [isOpen, charIndex, isDeleting, phraseIndex]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTypingText("");
      setCharIndex(0);
      setPhraseIndex(0);
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-[90%] max-w-2xl"
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full hover:bg-gray-100 z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>

              {/* Content */}
              <div className="p-8 pt-12">
                {/* Typing Animation Text */}
                <div className="text-center mb-6">
                  <p 
                    className="text-lg text-gray-500 h-7"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    {typingText}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <div 
                      className="flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-200 focus-within:border-primary focus-within:shadow-lg"
                      style={{ 
                        borderColor: 'hsl(50, 100%, 50%)',
                        backgroundColor: 'hsl(50, 100%, 97%)'
                      }}
                    >
                      <Search 
                        className="w-6 h-6 shrink-0" 
                        style={{ color: 'hsl(50, 100%, 40%)' }}
                      />
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="What are you looking for?"
                        className="flex-1 bg-transparent outline-none text-lg text-gray-800 placeholder:text-gray-400"
                        style={{ fontFamily: "'Quicksand', sans-serif" }}
                      />
                      {searchQuery && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSearchQuery("")}
                          className="shrink-0 rounded-full hover:bg-gray-200"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Button */}
                  <motion.button
                    type="submit"
                    className="w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200"
                    style={{ 
                      fontFamily: "'Quicksand', sans-serif",
                      backgroundColor: 'hsl(50, 100%, 50%)',
                      color: 'black'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!searchQuery.trim()}
                  >
                    Search
                  </motion.button>
                </form>

                {/* Quick Search Suggestions */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {["Music", "Torah", "Podcasts", "Inspiration"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(tag)}`);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
