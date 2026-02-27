import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Heart, Shield, Users, RefreshCw, FileText, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>About | YidVid</title>
        <meta name="description" content="Learn about YidVid - your premier destination for kosher Jewish content." />
      </Helmet>

      <div className="min-h-screen bg-white pt-14 pl-[200px] transition-all duration-300">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Fredoka One', 'Nunito', sans-serif", color: '#1A1A1A' }}
            >
              About YidVid
            </h1>
            <p 
              className="text-lg text-[#666666] max-w-2xl mx-auto"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Your premier destination for kosher Jewish content, curated with care for the entire family.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto"
          >
            {[
              {
                icon: Shield,
                title: "100% Kosher Content",
                description: "Every video is carefully curated to ensure family-friendly, appropriate content."
              },
              {
                icon: RefreshCw,
                title: "Auto-Updated Daily",
                description: "Fresh content is added automatically every day from trusted sources."
              },
              {
                icon: Heart,
                title: "Free Forever",
                description: "No subscriptions, no hidden fees. Access all content completely free."
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Wide variety of creators and channels serving the Jewish community."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] text-center"
              >
                <feature.icon 
                  className="w-10 h-10 mb-4 mx-auto" 
                  style={{ color: '#FFCC00' }} 
                />
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "'Quicksand', sans-serif", color: '#1A1A1A' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-[#666666]"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center p-8 rounded-2xl bg-[#F5F5F5] max-w-3xl mx-auto mb-10"
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "'Quicksand', sans-serif", color: '#1A1A1A' }}
            >
              Our Mission
            </h2>
            <p 
              className="text-[#666666] max-w-2xl mx-auto"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              YidVid was created to provide a safe, curated platform for Jewish families to access quality 
              kosher content. We believe everyone deserves access to inspiring, educational, and entertaining 
              videos without worrying about inappropriate content.
            </p>
          </motion.div>

          {/* Terms & Privacy Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center justify-center gap-4 max-w-3xl mx-auto"
          >
            <button
              onClick={() => navigate('/terms')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#1A1A1A] font-semibold text-sm hover:border-[#FFCC00] hover:shadow-sm transition-all"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <FileText className="w-4 h-4" style={{ color: '#FFCC00' }} />
              Terms & Conditions
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#1A1A1A] font-semibold text-sm hover:border-[#FFCC00] hover:shadow-sm transition-all"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <ScrollText className="w-4 h-4" style={{ color: '#FFCC00' }} />
              Privacy Policy
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default About;
