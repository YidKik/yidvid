import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface HoverCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick?: () => void;
  delay?: number;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <motion.div
        className="relative p-6 rounded-2xl border-2 overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(255, 0, 0, 0.2)',
        }}
        whileHover={{
          scale: 1.05,
          borderColor: 'rgba(255, 0, 0, 0.5)',
          boxShadow: '0 20px 40px rgba(255, 0, 0, 0.15)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Animated background gradient on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(255, 200, 0, 0.05) 100%)',
          }}
        />

        {/* Icon with bounce animation */}
        <motion.div
          className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}
          whileHover={{ 
            y: -5,
            rotate: [0, -10, 10, 0],
            transition: { rotate: { duration: 0.4 } }
          }}
        >
          <Icon className="w-7 h-7" style={{ color: 'hsl(0, 100%, 50%)' }} strokeWidth={2} />
        </motion.div>

        {/* Text content */}
        <div className="relative z-10">
          <motion.p
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#999' }}
          >
            {subtitle}
          </motion.p>
          <motion.h3
            className="text-xl font-bold"
            style={{ 
              fontFamily: "'Quicksand', sans-serif",
              color: '#1a1a1a'
            }}
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {title}
          </motion.h3>
        </div>

        {/* Decorative line that animates on hover */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-orange-400"
          initial={{ width: '0%' }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default HoverCard;
