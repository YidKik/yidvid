
import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardsProps {
  currentSection: number;
}

export const FeatureCards = ({ currentSection }: FeatureCardsProps) => {
  const features = [
    { title: "Free", description: "It doesn't cost anything to make an account and it doesn't cost anything to use it." },
    { title: "Kosher", description: "We are on our guidelines to make sure its 100 percent kosher" },
    { title: "Up to date", description: "Keeping the site up to date with every video that meets our guidelines" }
  ];

  return (
    <div className="pt-32 pb-16">
      <div className="flex justify-center gap-12 mb-16">
        {features.map((card, index) => (
          <motion.div
            key={card.title}
            className="bg-[#135d66] border-2 border-[#77b0aa] rounded-3xl p-10 w-96 h-80 flex flex-col justify-start items-center text-center"
            initial={{ opacity: 0, x: 100 }}
            animate={currentSection >= 1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <h3 className="text-[#e3fef7] text-5xl font-bold mb-8">{card.title}</h3>
            <p className="text-[#e3fef7] text-lg leading-relaxed">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
