
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Users, RefreshCw, Shield, Heart, ArrowRight, Music, BookOpen, Mic, Gamepad2, Film, Grid3X3, GraduationCap, Laugh, Megaphone } from 'lucide-react';
import FullScreenHero from '@/components/home/FullScreenHero';
import ScrollRevealSection from '@/components/home/ScrollRevealSection';
import HoverCard from '@/components/home/HoverCard';
import yidvidLogoFull from '@/assets/yidvid-logo-full.png';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const { suggestions } = useSearchSuggestions();

  const { scrollYProgress } = useScroll();
  
  // Smooth scroll progress for parallax effects
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Background color transition based on scroll
  const backgroundColor = useTransform(
    smoothProgress,
    [0, 0.3, 0.6, 1],
    ['#fafafa', '#fff5f5', '#fffaf0', '#f5f5f5']
  );

  // Rotate suggestions
  useEffect(() => {
    if (suggestions.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/videos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      icon: RefreshCw,
      title: "Auto-Updated",
      subtitle: "Fresh content",
    },
    {
      icon: Shield,
      title: "100% Kosher",
      subtitle: "Family-friendly",
    },
    {
      icon: Heart,
      title: "Free Forever",
      subtitle: "No subscriptions",
    },
    {
      icon: Users,
      title: "Many Channels",
      subtitle: "Wide variety",
    }
  ];

  const categories = [
    { icon: Music, label: "Music", path: "/videos?category=music" },
    { icon: BookOpen, label: "Torah", path: "/videos?category=torah" },
    { icon: Mic, label: "Podcasts", path: "/videos?category=podcast" },
    { icon: Gamepad2, label: "Entertainment", path: "/videos?category=entertainment" },
    { icon: Film, label: "Inspiration", path: "/videos?category=inspiration" },
    { icon: GraduationCap, label: "Education", path: "/videos?category=education" },
    { icon: Laugh, label: "Funny", path: "/videos?category=custom&name=Funny" },
    { icon: Megaphone, label: "Advertisement", path: "/videos?category=custom&name=Advertisement" },
  ];

  return (
    <motion.div 
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor }}
    >
      {/* Full Screen Hero Section */}
      <FullScreenHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        suggestions={suggestions}
        currentSuggestionIndex={currentSuggestionIndex}
      />

      {/* Features Section with scroll reveal */}
      <ScrollRevealSection className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-center mb-4"
            style={{ fontFamily: "'Nunito', 'Poppins', sans-serif", color: '#1a1a1a', letterSpacing: '-0.02em' }}
          >
            Built for <span style={{ color: 'hsl(0, 100%, 50%)' }}>You</span>
          </motion.h2>
          <p
            className="text-center mb-12 max-w-xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}
          >
            Everything you need for quality Jewish entertainment, all in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <HoverCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                subtitle={feature.subtitle}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </ScrollRevealSection>

      {/* Quick Access Section */}
      <ScrollRevealSection className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            style={{ fontFamily: "'Nunito', 'Poppins', sans-serif", color: '#1a1a1a' }}
          >
            Find What You <span style={{ color: 'hsl(0, 100%, 50%)' }}>Love</span>
          </motion.h2>
          <p
            className="text-center mb-12 max-w-xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}
          >
            Jump straight to your favorite content
          </p>

          {/* Category Buttons with staggered animation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {categories.map((category, index) => (
              <motion.button
                key={category.label}
                onClick={() => navigate(category.path)}
                className="group relative flex flex-col items-center gap-3 px-6 py-8 rounded-2xl font-semibold overflow-hidden"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 245, 245, 0.9) 100%)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  color: '#1a1a1a',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 15px 40px rgba(255, 0, 0, 0.15)',
                  borderColor: 'rgba(255, 0, 0, 0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated gradient overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.08) 0%, rgba(255, 200, 0, 0.06) 100%)'
                  }}
                />
                
                {/* Icon with animation */}
                <motion.div 
                  className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 0, 0, 0.08)' }}
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: [0, -10, 10, 0],
                    transition: { rotate: { duration: 0.4 } }
                  }}
                >
                  <category.icon className="w-7 h-7" style={{ color: 'hsl(0, 100%, 50%)' }} />
                </motion.div>
                
                <span className="relative z-10 text-lg">{category.label}</span>
                
                <motion.span 
                  className="relative z-10 text-xs flex items-center gap-1"
                  style={{ color: 'hsl(0, 100%, 50%)' }}
                >
                  Watch Now 
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-2" />
                </motion.span>

                {/* Bottom line animation */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-orange-400"
                  initial={{ width: '0%' }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={() => navigate('/videos')}
              className="group flex items-center justify-center gap-3 px-10 py-5 font-bold rounded-2xl overflow-hidden"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                background: 'linear-gradient(135deg, hsl(0, 100%, 50%) 0%, hsl(0, 100%, 40%) 100%)',
                color: 'white',
                boxShadow: '0 6px 25px rgba(255, 0, 0, 0.3)'
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 15px 40px rgba(255, 0, 0, 0.4)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Browse All Videos
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/videos?view=channels')}
              className="group flex items-center justify-center gap-3 px-10 py-5 font-bold rounded-2xl overflow-hidden"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 250, 0.9) 100%)',
                color: '#1a1a1a',
                border: '2px solid rgba(255, 0, 0, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12)',
                borderColor: 'rgba(255, 0, 0, 0.4)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Grid3X3 className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'hsl(0, 100%, 50%)' }} />
              <span>View All Channels</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" style={{ color: 'hsl(0, 100%, 50%)' }} />
            </motion.button>
          </motion.div>
        </div>
      </ScrollRevealSection>

      {/* Footer */}
      <motion.footer 
        className="py-8 px-6"
        style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid rgba(255, 0, 0, 0.2)' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img
              src={yidvidLogoFull}
              alt="YidVid"
              className="h-8 w-auto"
            />
          </div>
          <p 
            className="text-sm"
            style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}
          >
            © {new Date().getFullYear()} YidVid. Quality Jewish content for everyone.
          </p>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default LandingPage;
