
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';

export const MobileAuthSection = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
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
  );
};
