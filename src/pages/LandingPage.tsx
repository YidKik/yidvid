
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Users, RefreshCw, Shield, Heart, ArrowRight, Music, BookOpen, Mic, Gamepad2, Film, Grid3X3 } from 'lucide-react';
import HeroSearchSection from '@/components/home/HeroSearchSection';

const LandingPage = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
                  borderColor: 'hsl(0, 100%, 35%)'
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
                  style={{ fontFamily: "'Quicksand', sans-serif", color: 'hsl(50, 100%, 45%)' }}
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
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif", color: '#1a1a1a' }}
          >
            Find What You Love
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
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map((category) => (
              <motion.button
                key={category.label}
                onClick={() => navigate(category.path)}
                className="group flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  border: '2px solid rgba(255, 0, 0, 0.3)',
                  color: '#1a1a1a'
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 204, 0, 0.2)', borderColor: 'hsl(50, 100%, 50%)' }}
                whileTap={{ scale: 0.98 }}
              >
                <category.icon className="w-5 h-5" style={{ color: 'hsl(0, 100%, 50%)' }} />
                {category.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Secondary CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate('/videos')}
              className="group flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl shadow-md"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                backgroundColor: 'hsl(0, 100%, 50%)',
                color: 'white'
              }}
              whileHover={{ scale: 1.02, backgroundColor: 'hsl(0, 100%, 45%)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" />
              Browse All Videos
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/videos?view=channels')}
              className="group flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                backgroundColor: 'transparent',
                color: 'hsl(0, 100%, 50%)',
                border: '2px solid hsl(0, 100%, 50%)'
              }}
              whileHover={{ scale: 1.02, backgroundColor: 'hsl(0, 100%, 50%)', color: 'white' }}
              whileTap={{ scale: 0.98 }}
            >
              <Grid3X3 className="w-5 h-5" />
              View All Channels
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6" style={{ backgroundColor: 'hsl(0, 100%, 50%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif", color: 'white' }}
          >
            Ready to Explore?
          </h2>
          <p 
            className="mb-8 text-lg"
            style={{ fontFamily: "'Quicksand', sans-serif", color: 'rgba(255,255,255,0.9)' }}
          >
            Thousands of videos are waiting for you.
          </p>
          <motion.button
            onClick={() => navigate('/videos')}
            className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full shadow-lg"
            style={{ 
              fontFamily: "'Quicksand', sans-serif",
              backgroundColor: 'hsl(50, 100%, 50%)',
              color: 'black'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-5 h-5" />
            Start Watching Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer 
        className="py-8 px-6"
        style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid rgba(255, 0, 0, 0.2)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
              alt="YidVid"
              className="w-8 h-8"
            />
            <span 
              className="font-bold"
              style={{ fontFamily: "'Quicksand', sans-serif", color: 'hsl(0, 100%, 50%)' }}
            >
              YidVid
            </span>
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
};

export default LandingPage;
