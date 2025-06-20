
import { useState, useEffect } from 'react';

const WELCOME_SHOWN_KEY = 'yidvid_welcome_shown';

export const useWelcomeAnimation = () => {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if welcome animation has been shown before
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    setShowWelcome(!hasSeenWelcome);
  }, []);

  const markWelcomeAsShown = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    localStorage.removeItem(WELCOME_SHOWN_KEY);
    setShowWelcome(true);
  };

  return {
    showWelcome,
    markWelcomeAsShown,
    resetWelcome
  };
};
