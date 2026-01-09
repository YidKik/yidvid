import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Heart, Shield, Users, RefreshCw } from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | YidVid</title>
        <meta name="description" content="Learn about YidVid - your premier destination for kosher Jewish content." />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Fredoka One', 'Nunito', sans-serif", color: 'hsl(180, 100%, 13%)' }}
            >
              About YidVid
            </h1>
            <p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Your premier destination for kosher Jewish content, curated with care for the entire family.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid md:grid-cols-2 gap-8 mb-16"
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
                className="p-6 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <feature.icon 
                  className="w-10 h-10 mb-4" 
                  style={{ color: 'hsl(50, 100%, 45%)' }} 
                />
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "'Quicksand', sans-serif", color: 'hsl(180, 100%, 13%)' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-gray-600"
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
            className="text-center p-8 rounded-2xl"
            style={{ backgroundColor: 'hsl(50, 100%, 95%)' }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "'Quicksand', sans-serif", color: 'hsl(180, 100%, 13%)' }}
            >
              Our Mission
            </h2>
            <p 
              className="text-gray-700 max-w-2xl mx-auto"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              YidVid was created to provide a safe, curated platform for Jewish families to access quality 
              kosher content. We believe everyone deserves access to inspiring, educational, and entertaining 
              videos without worrying about inappropriate content.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default About;
