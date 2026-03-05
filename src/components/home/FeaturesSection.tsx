
import React from 'react';
import { motion } from 'framer-motion';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { DollarSign, ShieldCheck, RefreshCw } from 'lucide-react';

const icons = [DollarSign, ShieldCheck, RefreshCw];

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
              description: "We follow strict guidelines to make sure all content is 100% kosher and family-friendly."
            },
            {
              title: "Up to Date",
              description: "Keeping the site up to date with every video that meets our guidelines."
            }
          ].map((feature, i) => {
            const Icon = icons[i];
            return (
              <motion.div 
                key={feature.title}
                className="relative rounded-2xl border border-[#77b0aa]/30 bg-gradient-to-b from-[#135d66] to-[#0e4a52] p-8 flex flex-col items-center justify-center text-center min-h-[300px] shadow-lg shadow-black/20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <GlowingEffect
                  spread={50}
                  glow={true}
                  disabled={false}
                  proximity={80}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className="w-16 h-16 rounded-2xl bg-[#77b0aa]/15 border border-[#77b0aa]/30 flex items-center justify-center mb-6 relative z-10">
                  <Icon className="w-8 h-8 text-[#77b0aa]" />
                </div>
                <h3 className="text-5xl font-display text-[#e3fef7] mb-4 font-bold relative z-10">{feature.title}</h3>
                <p className="text-base text-[#77b0aa]/90 leading-relaxed relative z-10 max-w-[260px]">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
