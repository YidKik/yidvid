import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";

export const MobileHomeSection = () => {
  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, {
    once: true,
    amount: 0.1
  });

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, {
    once: true,
    amount: 0.1
  });

  const descriptionRef = useRef(null);
  const descriptionInView = useInView(descriptionRef, {
    once: true,
    amount: 0.1
  });

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, {
    once: true,
    amount: 0.1
  });

  const authRef = useRef(null);
  const authInView = useInView(authRef, {
    once: true,
    amount: 0.1
  });

  const actionsRef = useRef(null);
  const actionsInView = useInView(actionsRef, {
    once: true,
    amount: 0.1
  });

  const feedbackRef = useRef(null);
  const feedbackInView = useInView(feedbackRef, {
    once: true,
    amount: 0.1
  });

  const feedbackItems = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  ];

  return (
    <div className="min-h-screen w-full bg-[#003c43] px-6 overflow-y-auto">
      <motion.div 
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeInVariants}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center space-y-6 pt-24"
      >
        <h1 className="text-5xl font-bold text-[#e3fef7] leading-tight space-y-2">
          <div>Your</div>
          <div>Getaway to Jewish Content</div>
        </h1>
        <p className="text-lg text-[#77b0aa] px-4">
          Watch, share, and connect with the finest Jewish content from around the world.
        </p>
        <Link 
          to="/explore"
          className="px-8 py-3 bg-[#135d66] border border-[#ddf9f2] text-[#e3fef7] rounded-full text-base hover:bg-[#135d66]/90 transition-colors duration-300"
        >
          Explore
        </Link>
      </motion.div>

      <motion.div 
        ref={featuresRef}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
        variants={fadeInVariants}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-24 flex justify-center gap-4"
      >
        {['Free', 'Kosher', 'Up to date'].map((text) => (
          <div 
            key={text}
            className="px-4 py-2 border border-[#ddf9f2] rounded-full text-[#e3fef7] text-sm bg-[#135d66]"
          >
            {text}
          </div>
        ))}
      </motion.div>

      <motion.div 
        ref={descriptionRef}
        initial="hidden"
        animate={descriptionInView ? "visible" : "hidden"}
        variants={fadeInVariants}
        transition={{ duration: 0.6 }}
        className="mt-8 text-sm text-[#e3fef7] leading-relaxed space-y-4"
      >
        <p>
          We understand the importance of providing a safe and enjoyable platform for individuals and families to access entertainment content that aligns with their values. Our team is dedicated to creating a diverse range of videos that cater to a wide audience, while ensuring that all content meets our strict guidelines for kosher entertainment.
        </p>
        <p>
          By offering a free platform for users to create an account and access our content, we aim to make it easy for everyone to enjoy the latest videos in a secure environment. Our commitment to staying up-to-date with the latest trends and updates in the entertainment industry ensures that we are always bringing you the best content available.
        </p>
        <p>
          At YidVid, we take pride in our attention to detail and commitment to providing top-quality entertainment options for our users. We strive to maintain the highest level of standards in everything we do, so you can trust that you are getting nothing but the best when you visit our site. Thank you for choosing
        </p>
      </motion.div>

      <motion.div 
        ref={statsRef}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={fadeInVariants}
        transition={{ duration: 0.6 }}
        className="mt-12 space-y-4"
      >
        <div className="border-2 border-[#ddf9f2] rounded-3xl p-6 text-center bg-[#135d66]">
          <p className="text-[#77b0aa] text-xl mb-1">Over</p>
          <p className="text-[#e3fef7] text-5xl font-bold mb-1">
            <NumberTicker 
              value={10000} 
              className="text-[#e3fef7] text-5xl font-bold"
            />
          </p>
          <p className="text-[#77b0aa] text-xl">Videos</p>
        </div>
        
        <div className="border-2 border-[#ddf9f2] rounded-3xl p-6 text-center bg-[#135d66]">
          <p className="text-[#77b0aa] text-xl mb-1">Over</p>
          <p className="text-[#e3fef7] text-5xl font-bold mb-1">
            <NumberTicker 
              value={400} 
              className="text-[#e3fef7] text-5xl font-bold"
            />
          </p>
          <p className="text-[#77b0aa] text-xl">Channels</p>
        </div>
      </motion.div>

      <motion.div 
        ref={authRef}
        initial="hidden"
        animate={authInView ? "visible" : "hidden"}
        variants={fadeInVariants}
        transition={{ duration: 0.6 }}
        className="mt-8 space-y-3"
      >
        <Link to="/signup" className="block">
          <Button 
            variant="default" 
            className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
          >
            Create account
          </Button>
        </Link>
        <Link to="/signin" className="block">
          <Button 
            variant="default" 
            className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
          >
            Login
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        ref={actionsRef}
        initial="hidden"
        animate={actionsInView ? "visible" : "hidden"}
        variants={fadeInVariants}
        transition={{ duration: 0.6 }}
        className="mt-8 space-y-3 mb-8"
      >
        <Button 
          variant="default" 
          className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
        >
          Send feedback
        </Button>
        <Button 
          variant="default" 
          className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
        >
          Contact
        </Button>
        <Button 
          variant="default" 
          className="w-full py-4 text-base bg-[#135d66] text-[#e3fef7] border border-[#ddf9f2] hover:bg-[#135d66]/90 rounded-full"
        >
          Request channel
        </Button>
      </motion.div>

      <motion.div 
        ref={feedbackRef}
        initial="hidden"
        animate={feedbackInView ? "visible" : "hidden"}
        variants={fadeInVariants}
        transition={{ duration: 0.6 }}
        className="mt-12 mb-8"
      >
        <h2 className="text-[#e3fef7] text-2xl font-bold text-center mb-6">Feedback</h2>
        
        <div className="relative">
          <div className="overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            <div className="flex gap-4">
              {feedbackItems.map((feedback, index) => (
                <div 
                  key={index}
                  className="w-[66vw] flex-shrink-0 first:ml-4 last:mr-4"
                >
                  <div className="border border-[#ddf9f2] rounded-3xl p-5 bg-[#135d66] min-h-[120px] flex items-start">
                    <p className="text-[#e3fef7] text-sm leading-relaxed">
                      {feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-4">
            {feedbackItems.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#e3fef7]' : 'bg-[#77b0aa]'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <footer className="text-center text-[#77b0aa] text-xs py-4">
        All rights reserved © YidVid
      </footer>
    </div>
  );
};
