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

          {/* Modal - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div 
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-red-100 dark:border-red-900/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-red-400 to-yellow-400" />

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-5 right-4 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 z-10 transition-colors"
              >
                <X className="w-5 h-5 text-red-400" />
              </Button>

              {/* Content */}
              <div className="p-8 pt-10">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 mb-3">
                    <Search className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Search YidVid</span>
                  </div>
                </div>

                {/* Typing Animation Text */}
                <div className="text-center mb-6">
                  <p 
                    className="text-lg text-muted-foreground h-7"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    {typingText}
                    <span className="animate-pulse text-red-400">|</span>
                  </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <div 
                      className="flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-yellow-300 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/10 transition-all duration-200 focus-within:border-red-400 focus-within:shadow-lg focus-within:shadow-red-100/50 dark:focus-within:shadow-red-900/20"
                    >
                      <Search className="w-6 h-6 shrink-0 text-yellow-600 dark:text-yellow-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="What are you looking for?"
                        className="flex-1 bg-transparent outline-none text-lg text-foreground placeholder:text-muted-foreground"
                        style={{ fontFamily: "'Quicksand', sans-serif" }}
                      />
                      {searchQuery && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSearchQuery("")}
                          className="shrink-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Button */}
                  <motion.button
                    type="submit"
                    className="w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!searchQuery.trim()}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Search className="w-5 h-5" />
                      Search
                    </span>
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
                      className="px-4 py-2 rounded-full text-sm font-medium bg-muted/50 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Keyboard hint */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono">ESC</kbd> to close
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
