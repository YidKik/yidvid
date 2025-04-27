
import React from 'react';
import { motion } from 'framer-motion';

export const FeaturesSection = () => {
  return (
    <motion.section 
      className="relative z-10 w-full mt-[40vh] sm:mt-[15vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:gap-12">
          {[
            {
              title: "Free",
              description: "It doesn't cost anything to make an account and it doesn't cost anything to use it."
            },
            {
              title: "Kosher",
              description: "We are on our guidelines to make sure it's 100 percent kosher"
            },
            {
              title: "Up to date",
              description: "Keeping the site up to date with every video that meets our guidelines"
            }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              className="rounded-xl border-2 border-[#70a9a4] bg-[#135d66] p-6 flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <h3 className="text-3xl font-display text-[#e3fef7] mb-3">{feature.title}</h3>
              <p className="text-[#77b0aa] text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-16 px-4">
        <div className="text-center space-y-4">
          <h2 className="text-3xl text-[#77b0aa] mb-2">Over</h2>
          <div className="text-7xl font-bold text-white">10,000</div>
          <div className="text-3xl text-[#77b0aa]">Videos</div>
        </div>

        <div className="text-center space-y-4 mt-12">
          <h2 className="text-3xl text-[#77b0aa] mb-2">Over</h2>
          <div className="text-7xl font-bold text-white">400</div>
          <div className="text-3xl text-[#77b0aa]">Channels</div>
        </div>
      </div>
    </motion.section>
  );
};
