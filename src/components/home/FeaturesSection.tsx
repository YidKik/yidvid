
import React from 'react';
import { motion } from 'framer-motion';

export const FeaturesSection = () => {
  return (
    <motion.section 
      className="relative z-10 w-full mt-[15vh] sm:mt-[15vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12">
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
              className="rounded-3xl border-2 border-[#70a9a4] bg-[#135d66] h-auto sm:h-64 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <h3 className="text-2xl sm:text-4xl font-display text-[#e3fef7] mb-4 sm:mb-6">{feature.title}</h3>
              <p className="text-[#77b0aa] text-sm sm:text-base leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
