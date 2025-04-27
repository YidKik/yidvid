
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NewHomePage = () => {
  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png" alt="YidVid Logo" className="h-12" />
          <span className="text-white font-display text-2xl">YidVid</span>
        </div>
        <nav className="flex items-center space-x-8">
          <Link to="/" className="text-white hover:text-brand-lightest transition-colors">Home</Link>
          <Link to="/about" className="text-white hover:text-brand-lightest transition-colors">About</Link>
          <Link to="/contact" className="text-white hover:text-brand-lightest transition-colors">Contact</Link>
          <Link to="/signin" className="text-white hover:text-brand-lightest transition-colors">Sign in</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 grid grid-cols-2 gap-8">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-display text-white leading-tight">
            Your Gateway to<br />Jewish Content
          </h1>
          <p className="text-brand-light text-lg">
            Watch, share, and connect with the finest Jewish content from around the world.
          </p>
          <Link 
            to="/videos"
            className="inline-block px-8 py-3 bg-transparent border-2 border-brand-light text-white rounded-full hover:bg-brand-light hover:text-brand-darkest transition-all duration-300"
          >
            Explorer
          </Link>
        </motion.div>
        <div className="rounded-3xl border-2 border-brand-light bg-brand-dark/30 p-4">
          {/* Placeholder for videos preview */}
          <div className="w-full h-full rounded-2xl bg-brand-dark/50 flex items-center justify-center text-white">
            videos page pic
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-3 gap-10">
          {[
            {
              title: "Free",
              description: "It doesn't cost anything to make an account and it doesn't cost anything to use it."
            },
            {
              title: "Kosher",
              description: "we are on are guidelines to make sure its 100 percent kosher"
            },
            {
              title: "Up to date",
              description: "Keeping the site up to date with every video that meets our guidelines"
            }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              className="rounded-3xl border-2 border-brand-lightest bg-brand-dark h-72 flex flex-col items-center justify-center px-8 py-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <h3 className="text-4xl font-display text-white mb-6">{feature.title}</h3>
              <p className="text-brand-light text-lg">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16 grid grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl border-2 border-brand-light bg-brand-dark/30 text-center">
          <p className="text-brand-light text-xl mb-2">Over</p>
          <h3 className="text-5xl font-display text-white mb-2">400</h3>
          <p className="text-brand-light">Channels</p>
        </div>
        <div className="p-8 rounded-3xl border-2 border-brand-light bg-brand-dark/30 text-center">
          <p className="text-brand-light text-xl mb-2">Over</p>
          <h3 className="text-5xl font-display text-white mb-2">10,000</h3>
          <p className="text-brand-light">Videos</p>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-brand-dark py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-display text-white text-center mb-12">Feedback</h2>
          <div className="grid grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div 
                key={item} 
                className="p-6 rounded-3xl border-2 border-brand-lightest bg-brand-darkest h-80 flex items-center justify-center"
                style={{ minHeight: '320px' }}
              >
                <p className="text-brand-light">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-darkest py-12">
        <div className="container mx-auto px-6">
          <div className="flex justify-center space-x-10 mb-12">
            {['Contact', 'Send feedback', 'Request channel'].map((text) => (
              <button
                key={text}
                className="px-14 py-5 rounded-3xl border-2 border-brand-lightest text-white text-xl hover:bg-brand-dark transition-all duration-300"
              >
                {text}
              </button>
            ))}
          </div>
          <p className="text-center text-brand-light text-lg mt-8">All rights reserved @YidVid</p>
        </div>
      </footer>
    </div>
  );
};

export default NewHomePage;
