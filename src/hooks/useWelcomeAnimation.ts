
import { useState, useEffect } from 'react';

export const useWelcomeAnimation = () => {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    // Always show welcome animation on the home page
    setShowWelcome(true);
  }, []);

  const markWelcomeAsShown = () => {
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    setShowWelcome(true);
  };

  return {
    showWelcome,
    markWelcomeAsShown,
    resetWelcome
  };
};
