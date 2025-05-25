
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NumberTicker } from '@/components/ui/number-ticker';
import Auth from '@/pages/Auth';

export const EnhancedAboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  useEffect(() => {
    let accumulatedScroll = 0;
    const maxScroll = 500; // Increased scroll distance for fuller slide-out

    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const isInView = rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
      
      if (isInView) {
        e.preventDefault();
        e.stopPropagation();
        
        // Lock the page scroll completely
        document.body.style.overflow = 'hidden';
        setIsScrollLocked(true);
        
        // Handle scroll direction for sliding
        if (e.deltaY > 0) {
          // Scrolling down - slide about section out to the left
          accumulatedScroll += Math.abs(e.deltaY);
        } else {
          // Scrolling up - bring about section back from the left
          accumulatedScroll -= Math.abs(e.deltaY);
        }
        
        // Clamp the scroll value
        accumulatedScroll = Math.max(0, Math.min(maxScroll, accumulatedScroll));
        
        // Convert to progress (0 to 1)
        const newProgress = accumulatedScroll / maxScroll;
        setScrollProgress(newProgress);
        
        // If scrolled back to beginning, allow normal scrolling
        if (newProgress === 0 && e.deltaY < 0) {
          document.body.style.overflow = 'auto';
          setIsScrollLocked(false);
        }
        
        // If fully scrolled out and scrolling down more, continue to next section
        if (newProgress >= 1 && e.deltaY > 0) {
          document.body.style.overflow = 'auto';
          setIsScrollLocked(false);
          // Allow the scroll to continue to next section
          setTimeout(() => {
            window.scrollBy(0, e.deltaY);
          }, 10);
        }
      } else {
        // Not in view, allow normal scrolling
        document.body.style.overflow = 'auto';
        setIsScrollLocked(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollLocked && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'PageDown' || e.key === 'PageUp')) {
        e.preventDefault();
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore normal scrolling on cleanup
      document.body.style.overflow = 'auto';
    };
  }, [scrollProgress, isScrollLocked]);

  // Calculate transforms based on scroll progress - slide further left to completely disappear
  const aboutTextTransform = `translateX(${scrollProgress * -150}%)`;
  const aboutTextOpacity = Math.max(0, 1 - (scrollProgress * 1.5));
  
  // Cards slide up from bottom based on scroll progress
  const cardsTransform = `translateY(${100 - (scrollProgress * 100)}%)`;
  const cardsOpacity = scrollProgress;

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <section 
      ref={sectionRef} 
      id="about-section" 
      className="bg-[#003c43] px-6 py-16 relative min-h-screen"
    >
      <div className="container mx-auto relative h-screen flex items-center">
        {/* About Content with smaller blue background - slides out to the left */}
        <motion.div 
          style={{ 
            transform: aboutTextTransform, 
            opacity: aboutTextOpacity,
            transition: 'none' // Disable default transitions for smooth scroll control
          }}
          className="w-full"
        >
          <div className="mt-8 mb-6 bg-[#135d66] rounded-3xl p-12 mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-6xl font-display text-white">About</h2>
                <div className="space-y-6 text-lg text-white/90">
                  <p>
                    We understand the importance of providing a safe and enjoyable platform
                    for individuals and families to access content that aligns with
                    their values. Our team is dedicated to curating a diverse range of videos that
                    cater to a wide audience, while ensuring that all content meets our strict
                    guidelines.
                  </p>
                  <p>
                    By offering a free platform for users to create an account and access our content,
                    we aim to make it easy for everyone to enjoy the latest videos in a
                    secure environment. Our commitment to staying up-to-date with the latest
                    trends and updates ensures that we are always
                    bringing you the best content available.
                  </p>
                  <p>
                    At YidVid, we take pride in our attention to detail and commitment to providing
                    top-quality video options for our users. We strive to maintain
                    the highest level of standards in everything we do, so you can trust that you
                    are getting nothing but the best when you visit our site. Thank you for
                    choosing YidVid as your go-to source for kosher Jewish content.
                  </p>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <img
                  src="/public/yidvid-logo.png"
                  alt="YidVid Logo"
                  className="w-[600px] h-[600px] object-contain"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats and Auth Cards - slide up from bottom in the same blue background area */}
        <motion.div 
          style={{ 
            transform: cardsTransform, 
            opacity: cardsOpacity,
            transition: 'none' // Disable default transitions for smooth scroll control
          }}
          className="absolute inset-0 flex items-center w-full"
        >
          <div className="container mx-auto">
            <div className="mt-8 mb-6 bg-[#135d66] rounded-3xl p-12 mx-auto max-w-6xl">
              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-8">
                  <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8">
                    <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
                    <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                      <NumberTicker value={400} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
                    </h3>
                    <p className="text-[#77b0aa] text-4xl">Channels</p>
                  </div>
                  
                  <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8">
                    <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
                    <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                      <NumberTicker value={10000} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
                    </h3>
                    <p className="text-[#77b0aa] text-4xl">Videos</p>
                  </div>
                </div>

                <div className="flex justify-between space-x-8">
                  <button 
                    onClick={() => handleAuthClick('signup')}
                    className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-colors duration-300"
                  >
                    Create account
                  </button>

                  <button 
                    onClick={() => handleAuthClick('signin')}
                    className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-colors duration-300"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} initialTab={activeTab} />
      </div>
    </section>
  );
};

export default EnhancedAboutSection;
