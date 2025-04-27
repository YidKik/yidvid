
import React from 'react';
import { motion } from 'framer-motion';

export const FeaturesSection = () => {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="grid grid-cols-3 gap-10">
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
            className="rounded-3xl border-2 border-[#70a9a4] bg-[#135d66] h-72 flex flex-col items-center justify-center px-8 py-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          >
            <h3 className="text-5xl font-display text-[#e3fef7] mb-6">{feature.title}</h3>
            <p className="text-[#77b0aa] text-base leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
