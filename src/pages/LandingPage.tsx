
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Users, RefreshCw, Shield, Heart, ArrowRight, Music, BookOpen, Mic, Film, Sparkles, Grid3X3, GraduationCap } from 'lucide-react';
import HeroSearchSection from '@/components/home/HeroSearchSection';
import { Footer } from '@/components/layout/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useIsMobile();

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
    { icon: Film, label: "Entertainment", path: "/videos?category=entertainment" },
    { icon: Heart, label: "Inspiration", path: "/videos?category=inspiration" },
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

  const pageContent = (
    <>
    <Helmet>
      <title>YidVid - Watch Kosher Jewish Videos, Music & Torah Content Free</title>
      <meta name="description" content="YidVid is your premier free Jewish video platform. Watch thousands of kosher videos including music, Torah lectures, podcasts, education & entertainment from trusted channels." />
      <meta name="keywords" content="Jewish videos, kosher videos, Torah videos, Jewish music, Yiddish content, Jewish education, Jewish entertainment, kosher content, Jewish platform, free Jewish videos" />
      <link rel="canonical" href="https://yidvid.co" />
      <meta property="og:title" content="YidVid - Watch Kosher Jewish Videos Free" />
      <meta property="og:description" content="Your premier free Jewish video platform. Thousands of kosher videos - music, Torah, podcasts, education & entertainment." />
      <meta property="og:url" content="https://yidvid.co" />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content="YidVid - Watch Kosher Jewish Videos Free" />
      <meta name="twitter:description" content="Your premier free Jewish video platform. Thousands of kosher videos - music, Torah, podcasts, education & entertainment." />
    </Helmet>
    <div 
      className="min-h-screen bg-white overflow-x-hidden"
      style={{ paddingLeft: isMobile ? '0px' : isTablet ? '0px' : '64px' }}
    >
      {/* Hero Search Section */}
      <HeroSearchSection />

      {/* Features Section */}
      <section className={`${isMobile ? 'py-10 px-4' : isTablet ? 'py-14 px-5' : 'py-20 px-6'} bg-muted`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="type-h2 mb-2 md:mb-3 text-center"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Built for <span style={{ color: 'hsl(var(--brand))' }}>You</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="type-body text-center mb-6 md:mb-8 lg:mb-12 max-w-xl mx-auto"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Everything you need for quality Jewish entertainment, all in one place.
          </motion.p>

          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : isTablet ? 'grid-cols-2 gap-4 max-w-lg mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={`group relative rounded-card ${isMobile ? 'p-3 text-center flex flex-col items-center' : isTablet ? 'p-4 text-center flex flex-col items-center' : 'p-6'} border-2 transition-all duration-300 hover:shadow-raised cursor-pointer bg-white`}
                style={{
                  borderColor: 'hsl(var(--border))'
                }}
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.div 
                  className={`${isMobile ? 'w-10 h-10 rounded-control mb-2' : isTablet ? 'w-11 h-11 rounded-control mb-3' : 'w-14 h-14 rounded-card mb-4'} flex items-center justify-center bg-muted`}
                  variants={{ rest: { y: 0 }, hover: { y: -5 } }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    variants={feature.iconVariants}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <feature.icon className={`${isMobile ? 'w-5 h-5' : isTablet ? 'w-5 h-5' : 'w-7 h-7'}`} style={{ color: 'hsl(var(--brand))' }} strokeWidth={2} />
                  </motion.div>
                </motion.div>
                <h3 
                  className={`${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-xl'} font-bold mb-1`}
                  style={{ color: 'hsl(var(--brand))' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className={isMobile ? 'text-xs leading-snug' : isTablet ? 'text-xs' : ''}
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Quick Access Section */}
      <section className={`${isMobile ? 'py-10 px-4' : isTablet ? 'py-14 px-5' : 'py-20 px-6'}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="type-h2 mb-2 md:mb-3 text-center"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Find What You <span style={{ color: 'hsl(var(--brand))' }}>Love</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="type-body text-center mb-6 md:mb-8 lg:mb-12 max-w-xl mx-auto"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Jump straight to your favorite content
          </motion.p>

          {/* Category Buttons */}
          <motion.div
            variants={itemVariants}
            className={`grid ${isMobile ? 'grid-cols-2 gap-3 mb-8' : isTablet ? 'grid-cols-3 gap-4 mb-10' : 'grid-cols-2 md:grid-cols-3 gap-5 mb-12'}`}
          >
            {categories.map((category) => (
              <motion.button
                key={category.label}
                onClick={() => navigate(category.path)}
                className={`group relative flex flex-col items-center ${isMobile ? 'gap-1.5 px-3 py-4' : isTablet ? 'gap-2 px-4 py-5' : 'gap-3 px-6 py-8'} rounded-card font-semibold transition-all duration-500 overflow-hidden bg-white border border-border`}
                style={{ 
                  color: 'hsl(var(--foreground))',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.12)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Hover overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-muted"
                />
                
                {/* Icon container */}
                <div 
                  className={`relative z-10 ${isMobile ? 'w-10 h-10 rounded-control' : isTablet ? 'w-11 h-11 rounded-control' : 'w-14 h-14 rounded-card'} flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-muted`}
                >
                  <category.icon className={`${isMobile ? 'w-5 h-5' : isTablet ? 'w-5 h-5' : 'w-7 h-7'} transition-colors duration-300`} style={{ color: 'hsl(var(--brand))' }} />
                </div>
                
                <span className={`relative z-10 ${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'}`}>{category.label}</span>
                
                <span 
                  className={`relative z-10 ${isMobile ? 'text-[10px]' : 'text-xs'} flex items-center gap-1 transition-all duration-300 group-hover:gap-2`}
                  style={{ color: 'hsl(var(--brand))' }}
                >
                  Watch Now <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Secondary CTAs */}
          <motion.div
            variants={itemVariants}
            className={`flex flex-col items-center justify-center ${isMobile ? 'gap-3 pb-20' : 'sm:flex-row gap-5'}`}
          >
            <motion.button
              onClick={() => navigate('/videos')}
              className={`group relative flex items-center justify-center gap-2 ${isMobile ? 'px-6 text-sm' : isTablet ? 'px-7 text-sm' : 'px-8'} h-11 font-bold rounded-control overflow-hidden bg-primary text-white`}
              style={{ 
                boxShadow: '0 6px 25px rgba(255, 0, 0, 0.3)'
              }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 10px 35px rgba(255, 0, 0, 0.4)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Play className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} transition-transform duration-300 group-hover:scale-110`} />
              Browse All Videos
              <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} transition-transform duration-300 group-hover:translate-x-1`} />
            </motion.button>

            <motion.button
              onClick={() => navigate('/videos?view=channels')}
              className={`group relative flex items-center justify-center gap-2 ${isMobile ? 'px-6 text-sm' : isTablet ? 'px-7 text-sm' : 'px-8'} h-11 font-bold rounded-control overflow-hidden bg-white border border-border`}
              style={{ 
                color: 'hsl(var(--foreground))',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Grid3X3 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} transition-transform duration-300 group-hover:scale-110`} style={{ color: 'hsl(var(--brand))' }} />
              <span>View All Channels</span>
              <ArrowRight className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} transition-transform duration-300 group-hover:translate-x-1`} style={{ color: 'hsl(var(--brand))' }} />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
    </>
  );

  return pageContent;
};

export default LandingPage;
