
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Play, Users, Video, Loader2 } from 'lucide-react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { useContentPreloader } from '@/hooks/useContentPreloader';

interface WelcomeAnimationProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  
  // Start preloading content immediately
  const { preloadComplete, isPreloading } = useContentPreloader(true);

  const steps = [
    {
      title: "Welcome to YidVid",
      subtitle: "Your Gateway to Jewish Content",
      description: "Watch, share, and connect with the finest Jewish content from around the world.",
      icon: <Play className="w-12 h-12" />
    },
    {
      title: "Discover Amazing Content",
      subtitle: "Over 400 Channels",
      description: "Explore thousands of videos from trusted Jewish content creators.",
      icon: <Users className="w-12 h-12" />
    },
    {
      title: "Ready to Explore?",
      subtitle: "Let's Get Started",
      description: "Dive into our curated collection of inspiring Jewish videos.",
      icon: <Video className="w-12 h-12" />
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Auto-redirect after showing all steps, but only if preloading is complete
        setTimeout(() => {
          if (preloadComplete) {
            handleComplete();
          } else {
            // Keep waiting for preload to complete
            const checkPreload = setInterval(() => {
              if (preloadComplete) {
                clearInterval(checkPreload);
                handleComplete();
              }
            }, 500);
          }
        }, 2000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStep, preloadComplete]);

  const handleComplete = () => {
    // Only complete if preloading is done
    if (preloadComplete) {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
        navigate('/videos');
      }, 500);
    } else {
      console.info('Welcome animation: Waiting for preload to complete before navigation...');
    }
  };

  const handleSkip = () => {
    // Allow skip but show loading if not complete
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
      navigate('/videos');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Soft, subtle background with light gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/95 via-pink-50/95 to-white/95 backdrop-blur-sm" />
          
          {/* Subtle animated circles for visual interest */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large subtle background circles */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.2, 0.8], 
                opacity: [0, 0.1, 0],
                x: [0, 100, 0],
                y: [0, -50, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-red-200/20 to-pink-200/20"
            />
            
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ 
                scale: [0.6, 1, 0.6], 
                opacity: [0, 0.08, 0],
                x: [0, -80, 0],
                y: [0, 60, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-pink-200/15 to-red-200/15"
            />
            
            {/* Small floating dots for subtle movement */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight
                }}
                animate={{ 
                  opacity: [0, 0.3, 0],
                  scale: [0, 1, 0],
                  y: [null, -200],
                }}
                transition={{
                  duration: 6,
                  delay: i * 0.8,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="absolute"
              >
                <div className="w-1 h-1 bg-red-300/40 rounded-full" />
              </motion.div>
            ))}
          </div>
          
          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors text-gray-600 shadow-lg"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Main Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <img 
                src="/lovable-uploads/dd4fbfcb-aeb9-4cd3-a7b1-9dbf07b81a43.png" 
                alt="YidVid Logo" 
                className="w-32 h-32 mx-auto object-contain drop-shadow-lg"
              />
            </motion.div>

            {/* Animated Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center text-[#ea384c] drop-shadow-sm"
                >
                  {steps[currentStep].icon}
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-bold text-gray-800 drop-shadow-sm"
                >
                  {steps[currentStep].title}
                </motion.h1>

                {/* Subtitle with special handling for numbers */}
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl md:text-3xl text-[#ea384c] font-medium drop-shadow-sm"
                >
                  {currentStep === 1 ? (
                    <span className="flex items-center justify-center gap-2">
                      Over <NumberTicker value={400} className="text-gray-800 font-bold" /> Channels
                    </span>
                  ) : (
                    steps[currentStep].subtitle
                  )}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed drop-shadow-sm"
                >
                  {steps[currentStep].description}
                </motion.p>

                {/* Progress Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center space-x-2 mt-8"
                >
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentStep ? 'bg-[#ea384c] scale-125 shadow-md' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Auto-redirect message on last step */}
            {currentStep === steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-8"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isPreloading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  <p className="text-gray-600 text-sm">
                    {isPreloading ? 'Preparing your content...' : 'Ready to explore!'}
                  </p>
                </div>
                <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto mt-2 overflow-hidden shadow-sm">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: preloadComplete ? '100%' : '60%' }}
                    transition={{ duration: preloadComplete ? 0.5 : 2, ease: "linear" }}
                    className="h-full bg-[#ea384c] rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
