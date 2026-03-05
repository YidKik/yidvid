
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Tv, Video, UserPlus, LogIn } from 'lucide-react';
import Auth from '@/pages/Auth';

export const StatsSection = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <section className="container mx-auto px-6 py-24 space-y-8">
      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
        <motion.div 
          className="h-80 rounded-3xl border border-[#77b0aa]/30 bg-gradient-to-br from-[#003c43] to-[#0a2e33] flex flex-col items-center justify-center p-8 shadow-lg shadow-black/20"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ borderColor: 'rgba(221, 249, 242, 0.4)', transition: { duration: 0.3 } }}
        >
          <Tv className="w-10 h-10 text-[#77b0aa] mb-4" />
          <p className="text-[#77b0aa] text-3xl mb-3">Over</p>
          <h3 className="text-[#ddf9f2] text-7xl font-bold mb-3">
            <NumberTicker value={400} className="text-[#ddf9f2] text-7xl font-bold" />
          </h3>
          <p className="text-[#77b0aa] text-3xl">Channels</p>
        </motion.div>
        
        <motion.div 
          className="h-80 rounded-3xl border border-[#77b0aa]/30 bg-gradient-to-br from-[#003c43] to-[#0a2e33] flex flex-col items-center justify-center p-8 shadow-lg shadow-black/20"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ borderColor: 'rgba(221, 249, 242, 0.4)', transition: { duration: 0.3 } }}
        >
          <Video className="w-10 h-10 text-[#77b0aa] mb-4" />
          <p className="text-[#77b0aa] text-3xl mb-3">Over</p>
          <h3 className="text-[#ddf9f2] text-7xl font-bold mb-3">
            <NumberTicker value={10000} className="text-[#ddf9f2] text-7xl font-bold" />
          </h3>
          <p className="text-[#77b0aa] text-3xl">Videos</p>
        </motion.div>
      </div>

      <div className="flex justify-between space-x-8 max-w-4xl mx-auto">
        <motion.button 
          onClick={() => handleAuthClick('signup')}
          className="group w-[calc(50%-1rem)] h-72 flex flex-col items-center justify-center gap-4 rounded-3xl border border-[#77b0aa]/30 bg-gradient-to-br from-[#135d66]/50 to-transparent text-[#ddf9f2] text-2xl font-medium hover:border-[#ddf9f2]/50 transition-all duration-300 shadow-lg shadow-black/10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <UserPlus className="w-10 h-10 text-[#77b0aa] group-hover:text-[#ddf9f2] transition-colors" />
          Create Account
        </motion.button>

        <motion.button 
          onClick={() => handleAuthClick('signin')}
          className="group w-[calc(50%-1rem)] h-72 flex flex-col items-center justify-center gap-4 rounded-3xl border border-[#77b0aa]/30 bg-gradient-to-br from-[#135d66]/50 to-transparent text-[#ddf9f2] text-2xl font-medium hover:border-[#ddf9f2]/50 transition-all duration-300 shadow-lg shadow-black/10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogIn className="w-10 h-10 text-[#77b0aa] group-hover:text-[#ddf9f2] transition-colors" />
          Login
        </motion.button>
      </div>

      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} initialTab={activeTab} />
    </section>
  );
};
