
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Users, RefreshCw, Shield, Sparkles, ArrowRight, Music, BookOpen, Mic, Gamepad2, Film, Grid3X3 } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: RefreshCw,
      title: "Auto-Updated",
      description: "Fresh content added automatically every day"
    },
    {
      icon: Shield,
      title: "100% Kosher",
      description: "Curated and verified family-friendly content"
    },
    {
      icon: Sparkles,
      title: "Free to Use",
      description: "No subscriptions, no hidden fees"
    },
    {
      icon: Users,
      title: "Many Channels",
      description: "Wide variety of creators and content"
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
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-16">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-highlight/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.img
            src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
            alt="YidVid Logo"
            className="w-24 h-24 mx-auto mb-8 drop-shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          />

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-foreground mb-6"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Welcome to{' '}
            <span className="text-primary">YidVid</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your trusted destination for quality Jewish content.
            <br />
            <span className="text-foreground font-medium">Safe, curated, and always up to date.</span>
          </motion.p>

          {/* Main CTA Button */}
          <motion.button
            onClick={() => navigate('/videos')}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground text-xl font-bold rounded-full shadow-lg overflow-hidden"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              <Play className="w-6 h-6" strokeWidth={2.5} />
              Start Watching
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
            <motion.div
              className="absolute inset-0 bg-highlight"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-highlight-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-6 h-6" strokeWidth={2.5} />
              Start Watching
              <ArrowRight className="w-5 h-5" />
            </span>
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1 },
            y: { repeat: Infinity, duration: 1.5 }
          }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

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
            className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Why Choose <span className="text-primary">YidVid</span>?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-center text-muted-foreground mb-12 max-w-xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            We're different from other platforms. Here's what makes us special.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative bg-primary/10 rounded-2xl p-6 border-2 border-primary/20 hover:border-highlight hover:bg-highlight/10 transition-all duration-300 hover:shadow-lg"
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-highlight/30 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-highlight transition-colors" strokeWidth={2} />
                </div>
                <h3 
                  className="text-xl font-bold text-foreground mb-2"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-muted-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
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
            className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Find What You Love
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-center text-muted-foreground mb-12 max-w-xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
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
                className="group flex items-center gap-2 px-6 py-3 bg-primary/10 border-2 border-primary/30 rounded-full text-foreground font-medium hover:border-highlight hover:bg-highlight/20 transition-all duration-300"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <category.icon className="w-5 h-5 text-primary group-hover:text-highlight transition-colors" />
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
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-md"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" />
              Browse All Videos
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/videos?view=channels')}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-background border-2 border-primary text-primary font-bold rounded-xl"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              whileTap={{ scale: 0.98 }}
            >
              <Grid3X3 className="w-5 h-5" />
              View All Channels
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-primary">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Ready to Explore?
          </h2>
          <p 
            className="text-primary-foreground/80 mb-8 text-lg"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Thousands of videos are waiting for you.
          </p>
          <motion.button
            onClick={() => navigate('/videos')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-highlight text-highlight-foreground font-bold rounded-full shadow-lg"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
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
      <footer className="py-8 px-6 bg-foreground/5 border-t border-primary/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png"
              alt="YidVid"
              className="w-8 h-8"
            />
            <span 
              className="font-bold text-primary"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              YidVid
            </span>
          </div>
          <p 
            className="text-sm text-foreground/70"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            © {new Date().getFullYear()} YidVid. Quality Jewish content for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
