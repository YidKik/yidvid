
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
          <p className="text-[#77b0aa] text-lg leading-relaxed">
            Watch, share, and connect with the finest Jewish content from around the world.
          </p>
          <Link 
            to="/videos"
            className="inline-block px-8 py-3 bg-transparent border-2 border-brand-light text-[#77b0aa] rounded-full hover:bg-brand-light hover:text-brand-darkest transition-all duration-300"
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
              description: "We are on our guidelines to make sure it's 100 percent kosher"
            },
            {
              title: "Up to date",
              description: "Keeping the site up to date with every video that meets our guidelines"
            }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              className="rounded-3xl border-2 border-[#70a9a4] bg-[#135d66] h-72 flex flex-col items-center justify-center px-8 py-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <h3 className="text-5xl font-display text-[#e3fef7] mb-6">{feature.title}</h3>
              <p className="text-[#77b0aa] text-base leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-6xl font-display text-white">About</h2>
            <div className="space-y-6 text-lg text-brand-light">
              <p>
                We understand the importance of providing a safe and enjoyable platform
                for individuals and families to access entertainment content that aligns with
                their values. Our team is dedicated to curating a diverse range of videos that
                cater to a wide audience, while ensuring that all content meets our strict
                guidelines for kosher entertainment.
              </p>
              <p>
                By offering a free platform for users to create an account and access our content,
                we aim to make it easy for everyone to enjoy the latest videos in a
                secure environment. Our commitment to staying up-to-date with the latest
                trends and updates in the entertainment industry ensures that we are always
                bringing you the best content available.
              </p>
              <p>
                At YidVid, we take pride in our attention to detail and commitment to providing
                top-quality entertainment options for our users. We strive to maintain
                the highest level of standards in everything we do, so you can trust that you
                are getting nothing but the best when you visit our site. Thank you for
                choosing YidVid as your go-to source for kosher entertainment content.
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="relative w-96 h-96">
              <div className="absolute inset-0 bg-brand-dark rounded-3xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-brand-light/20 rounded-3xl transform -rotate-3"></div>
              <div className="relative flex items-center justify-center h-full">
                <img
                  src="/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"
                  alt="YidVid Logo"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="relative group h-96">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-[#135d66] to-[#ddf9f2] animate-border-flow">
              <div className="absolute inset-0 rounded-3xl bg-brand-darkest"></div>
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
              <p className="text-[#77b0aa] text-2xl mb-4">Over</p>
              <h3 className="text-[#ddf9f2] text-7xl font-display mb-4">400</h3>
              <p className="text-[#77b0aa] text-2xl">Channels</p>
            </div>
          </div>
          
          <div className="relative group h-96">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-[#135d66] to-[#ddf9f2] animate-border-flow">
              <div className="absolute inset-0 rounded-3xl bg-brand-darkest"></div>
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
              <p className="text-[#77b0aa] text-2xl mb-4">Over</p>
              <h3 className="text-[#ddf9f2] text-7xl font-display mb-4">10,000</h3>
              <p className="text-[#77b0aa] text-2xl">Videos</p>
            </div>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex justify-center space-x-8">
          <Link 
            to="/signup"
            className="relative"
          >
            <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-[#135d66] to-[#ddf9f2] animate-border-flow">
              <div className="absolute inset-0 rounded-3xl bg-brand-darkest"></div>
            </div>
            <div className="relative z-10 rounded-3xl px-16 py-4">
              <span className="text-[#ddf9f2] text-xl">Create account</span>
            </div>
          </Link>

          <Link 
            to="/signin"
            className="relative"
          >
            <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-[#135d66] to-[#ddf9f2] animate-border-flow">
              <div className="absolute inset-0 rounded-3xl bg-brand-darkest"></div>
            </div>
            <div className="relative z-10 rounded-3xl px-16 py-4">
              <span className="text-[#ddf9f2] text-xl">Login</span>
            </div>
          </Link>
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
