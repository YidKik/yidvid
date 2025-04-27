
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useHomeAnimations = (channelsSectionRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    // Reset body and document overflow styles
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';

    // Hero content fade out animation
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        scrollTrigger: {
          trigger: heroContent,
          start: 'top top',
          end: '+=300',
          scrub: 0.5,
        },
        y: -100,
        opacity: 0,
        ease: 'power2.inOut',
      });
    }

    // Channels section fade in animation
    if (channelsSectionRef.current) {
      gsap.fromTo(
        channelsSectionRef.current,
        { 
          y: 100,
          opacity: 0 
        },
        {
          scrollTrigger: {
            trigger: '.hero-parallax-section',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
          y: 0,
          opacity: 1,
          ease: 'power2.out',
        }
      );
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [channelsSectionRef]);
};
