
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Play, Users, Video } from 'lucide-react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

interface WelcomeAnimationProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

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
        // Auto-redirect after showing all steps
        setTimeout(() => {
          handleComplete();
        }, 2000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      navigate('/videos');
    }, 500);
  };

  const handleSkip = () => {
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
          <BackgroundGradientAnimation 
            interactive={false}
            gradientBackgroundStart="#1a0000"
            gradientBackgroundEnd="#2d1114"
            firstColor="234, 56, 76"
            secondColor="220, 38, 127"
            thirdColor="255, 255, 255"
            fourthColor="234, 56, 76"
            fifthColor="255, 255, 255"
            blendingValue="soft-light"
            containerClassName="absolute inset-0"
          />
          
          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
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
                className="w-32 h-32 mx-auto object-contain"
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
                  className="flex justify-center text-[#ea384c]"
                >
                  {steps[currentStep].icon}
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-bold text-white"
                >
                  {steps[currentStep].title}
                </motion.h1>

                {/* Subtitle with special handling for numbers */}
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl md:text-3xl text-[#ea384c] font-medium"
                >
                  {currentStep === 1 ? (
                    <span className="flex items-center justify-center gap-2">
                      Over <NumberTicker value={400} className="text-white" /> Channels
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
                  className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
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
                        index === currentStep ? 'bg-[#ea384c] scale-125' : 'bg-white/30'
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
                <p className="text-white/80 text-sm">
                  Redirecting to videos in a moment...
                </p>
                <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="h-full bg-[#ea384c] rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Floating Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight
                }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0],
                  y: [null, -100],
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="absolute"
              >
                <div className="w-2 h-2 bg-[#ea384c] rounded-full" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
