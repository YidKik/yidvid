
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Users, RefreshCw, Shield, Heart, ArrowRight, Music, BookOpen, Mic, Gamepad2, Film, Grid3X3, GraduationCap } from 'lucide-react';
import HeroSearchSection from '@/components/home/HeroSearchSection';
import IntroAnimation from '@/components/home/IntroAnimation';
import yidvidLogoFull from '@/assets/yidvid-logo-full.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  // Check if we should skip the intro (e.g., coming back from another page)
  useEffect(() => {
    const skipWelcome = new URLSearchParams(location.search).get('skipWelcome');
    if (skipWelcome === 'true' || sessionStorage.getItem('introShown') === 'true') {
      setShowIntro(false);
      setIntroComplete(true);
    }
  }, [location.search]);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    sessionStorage.setItem('introShown', 'true');
    // Delay hiding the intro overlay slightly
    setTimeout(() => setShowIntro(false), 300);
  };

  const features = [
    {
      icon: RefreshCw,
      title: "Auto-Updated",
      description: "Fresh content added automatically every day",
      iconVariants: {
        rest: { rotate: 0 },
        hover: { rotate: 360, transition: { duration: 1, ease: "easeInOut" } }
      }
    },
    {
      icon: Shield,
      title: "100% Kosher",
      description: "Curated and verified family-friendly content",
      iconVariants: {
        rest: { rotateY: 0 },
        hover: { rotateY: 360, transition: { duration: 0.8, ease: "easeInOut" } }
      }
    },
    {
      icon: Heart,
      title: "Free Forever",
      description: "No subscriptions, no hidden fees",
      iconVariants: {
        rest: { scale: 1 },
        hover: { scale: [1, 1.3, 1, 1.3, 1], transition: { duration: 1, ease: "easeInOut" } }
      }
    },
    {
      icon: Users,
      title: "Many Channels",
      description: "Wide variety of creators and content",
      iconVariants: {
        rest: { x: 0 },
        hover: { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.8, ease: "easeInOut" } }
      }
    }
  ];

  const categories = [
    { icon: Music, label: "Music", path: "/videos?category=music" },
    { icon: BookOpen, label: "Torah", path: "/videos?category=torah" },
    { icon: Mic, label: "Podcasts", path: "/videos?category=podcast" },
    { icon: Gamepad2, label: "Entertainment", path: "/videos?category=entertainment" },
    { icon: Film, label: "Inspiration", path: "/videos?category=inspiration" },
    { icon: GraduationCap, label: "Education", path: "/videos?category=education" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Content wrapper that will be animated
  const pageContent = (
    <div className="min-h-screen bg-background overflow-x-hidden" style={{ paddingLeft: '64px' }}>
      {/* Hero Search Section with Typing Effect */}
      <HeroSearchSection />

      {/* Features Section */}
      <section className="py-20 px-6 bg-primary/5">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-extrabold text-center mb-4"
            style={{ fontFamily: "'Nunito', 'Poppins', sans-serif", color: '#1a1a1a', letterSpacing: '-0.02em' }}
          >
            Built for <span style={{ color: 'hsl(0, 100%, 50%)' }}>You</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-center mb-12 max-w-xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}
          >
            Everything you need for quality Jewish entertainment, all in one place.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255, 0, 0, 0.08)',
                  borderColor: 'hsl(0, 100%, 50%)'
                }}
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(255, 0, 0, 0.15)' }}
                  variants={{ rest: { y: 0 }, hover: { y: -5 } }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    variants={feature.iconVariants}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: 'hsl(0, 100%, 50%)' }} strokeWidth={2} />
                  </motion.div>
                </motion.div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "'Quicksand', sans-serif", color: 'hsl(0, 100%, 50%)' }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            style={{ fontFamily: "'Nunito', 'Poppins', sans-serif", color: '#1a1a1a' }}
          >
            Find What You <span style={{ color: 'hsl(0, 100%, 50%)' }}>Love</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-center mb-12 max-w-xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}
          >
            Jump straight to your favorite content
          </motion.p>

          {/* Category Buttons */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12"
          >
            {categories.map((category) => (
              <motion.button
                key={category.label}
                onClick={() => navigate(category.path)}
                className="group relative flex flex-col items-center gap-3 px-6 py-8 rounded-2xl font-semibold transition-all duration-500 overflow-hidden"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 245, 245, 0.9) 100%)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  color: '#1a1a1a',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.12)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Gradient overlay on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.08) 0%, rgba(255, 200, 0, 0.06) 100%)'
                  }}
                />
                
                {/* Icon container with subtle background */}
                <div 
                  className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(255, 0, 0, 0.08)' }}
                >
                  <category.icon className="w-7 h-7 transition-colors duration-300" style={{ color: 'hsl(0, 100%, 50%)' }} />
                </div>
                
                <span className="relative z-10 text-lg">{category.label}</span>
                
                <span 
                  className="relative z-10 text-xs flex items-center gap-1 transition-all duration-300 group-hover:gap-2"
                  style={{ color: 'hsl(0, 100%, 50%)' }}
                >
                  Watch Now <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Secondary CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            <motion.button
              onClick={() => navigate('/videos')}
              className="group relative flex items-center justify-center gap-3 px-10 py-5 font-bold rounded-2xl overflow-hidden"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                background: 'linear-gradient(135deg, hsl(0, 100%, 50%) 0%, hsl(0, 100%, 40%) 100%)',
                color: 'white',
                boxShadow: '0 6px 25px rgba(255, 0, 0, 0.3)'
              }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 10px 35px rgba(255, 0, 0, 0.4)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Play className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              Browse All Videos
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/videos?view=channels')}
              className="group relative flex items-center justify-center gap-3 px-10 py-5 font-bold rounded-2xl overflow-hidden"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 250, 0.9) 100%)',
                color: '#1a1a1a',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Grid3X3 className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: 'hsl(0, 100%, 50%)' }} />
              <span>View All Channels</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'hsl(0, 100%, 50%)' }} />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer 
        className="py-8 px-6"
        style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid rgba(255, 0, 0, 0.2)' }}
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
      </footer>
    </div>
  );

  // Wrap with intro animation if needed
  if (showIntro) {
    return (
      <IntroAnimation onComplete={handleIntroComplete}>
        {pageContent}
      </IntroAnimation>
    );
  }

  return pageContent;
};

export default LandingPage;
