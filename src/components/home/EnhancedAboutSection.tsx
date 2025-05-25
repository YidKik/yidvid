
import React, { useRef, useEffect, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { NumberTicker } from '@/components/ui/number-ticker';
import Auth from '@/pages/Auth';

export const EnhancedAboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    let accumulatedScroll = 0;
    const maxScroll = 400; // Maximum scroll distance for complete transition

    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const isInView = rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
      
      if (isInView) {
        e.preventDefault();
        e.stopPropagation();
        
        // Lock page scroll completely
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Handle scroll direction for horizontal sliding
        if (e.deltaY > 0) {
          // Scrolling down - slide about section out to the left, cards in from right
          accumulatedScroll += Math.abs(e.deltaY) * 0.8; // Slower, smoother scroll
        } else {
          // Scrolling up - bring about section back from left, cards out to right
          accumulatedScroll -= Math.abs(e.deltaY) * 0.8;
        }
        
        // Clamp the scroll value
        accumulatedScroll = Math.max(0, Math.min(maxScroll, accumulatedScroll));
        
        // Convert to progress (0 to 1)
        const newProgress = accumulatedScroll / maxScroll;
        setScrollProgress(newProgress);
        
        // If scrolled back to beginning, allow normal scrolling
        if (newProgress === 0 && e.deltaY < 0) {
          document.body.style.overflow = 'auto';
          document.documentElement.style.overflow = 'auto';
        }
        
        // If fully scrolled and scrolling down more, continue to next section
        if (newProgress >= 1 && e.deltaY > 0) {
          document.body.style.overflow = 'auto';
          document.documentElement.style.overflow = 'auto';
          // Allow the scroll to continue to next section
          setTimeout(() => {
            window.scrollBy(0, e.deltaY * 0.5);
          }, 50);
        }
      } else {
        // Not in view, allow normal scrolling
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      // Restore normal scrolling on cleanup
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [scrollProgress]);

  // About section slides out to the left
  const aboutTransformX = useTransform(() => -scrollProgress * 120); // Slides fully off screen
  const aboutOpacity = useTransform(() => Math.max(0, 1 - scrollProgress * 1.2));
  
  // Cards slide in from the right
  const cardsTransformX = useTransform(() => 100 - (scrollProgress * 120)); // Starts off-screen right, slides to center
  const cardsOpacity = useTransform(() => Math.min(1, scrollProgress * 1.5));

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <section 
      ref={sectionRef} 
      id="about-section" 
      className="bg-[#003c43] px-6 py-16 relative min-h-screen overflow-hidden"
    >
      <div className="container mx-auto relative h-screen flex items-center">
        {/* About Content - slides out to the left */}
        <motion.div 
          style={{ 
            x: aboutTransformX, 
            opacity: aboutOpacity 
          }}
          className="absolute inset-0 flex items-center w-full"
        >
          <div className="w-full">
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
          </div>
        </motion.div>

        {/* Stats and Auth Cards - slide in from the right */}
        <motion.div 
          style={{ 
            x: cardsTransformX, 
            opacity: cardsOpacity 
          }}
          className="absolute inset-0 flex items-center w-full"
        >
          <div className="container mx-auto">
            <div className="mt-8 mb-6 bg-[#135d66] rounded-3xl p-12 mx-auto max-w-6xl">
              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-8">
                  <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8 transform transition-all duration-500 hover:scale-105">
                    <p className="text-[#77b0aa] text-4xl mb-4">Over</p>
                    <h3 className="text-[#ddf9f2] text-8xl font-sans font-bold mb-4">
                      <NumberTicker value={400} className="text-[#ddf9f2] text-8xl font-sans font-bold" />
                    </h3>
                    <p className="text-[#77b0aa] text-4xl">Channels</p>
                  </div>
                  
                  <div className="h-80 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] flex flex-col items-center justify-center p-8 transform transition-all duration-500 hover:scale-105">
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
                    className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-all duration-300 hover:scale-105"
                  >
                    Create account
                  </button>

                  <button 
                    onClick={() => handleAuthClick('signin')}
                    className="w-[calc(50%-1rem)] h-16 flex items-center justify-center rounded-3xl border-2 border-[#ddf9f2] bg-transparent text-[#ddf9f2] text-2xl hover:bg-[#135d66] transition-all duration-300 hover:scale-105"
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
