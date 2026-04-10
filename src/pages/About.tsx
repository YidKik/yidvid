import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Heart, Shield, Users, RefreshCw, FileText, ScrollText, MessageSquare } from "lucide-react";
import { ContactDialog } from "@/components/contact/ContactDialog";
import { TermsOfServiceDialog } from "@/components/auth/TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "@/components/auth/PrivacyPolicyDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const About = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const { isMobile } = useIsMobile();

  return (
    <>
      <Helmet>
        <title>About | YidVid</title>
        <meta name="description" content="Learn about YidVid - your premier destination for kosher Jewish content." />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-14 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
        <div className={`max-w-4xl mx-auto ${isMobile ? 'px-4 py-8' : 'px-6 py-12'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 
              className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold mb-4`}
              style={{ fontFamily: "'Fredoka One', 'Nunito', sans-serif" }}
              className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold mb-4 text-[#000000] dark:text-[#e8e8e8]`}
            >
              About YidVid
            </h1>
            <p 
              className={`${isMobile ? 'text-base' : 'text-lg'} max-w-2xl mx-auto`}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              className={`${isMobile ? 'text-base' : 'text-lg'} max-w-2xl mx-auto text-[#666666] dark:text-[#aaa]`}
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
                className={`${isMobile ? 'p-4' : 'p-6'} rounded-2xl bg-[#F5F5F5] dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#333] text-center`}
              >
                <feature.icon 
                  className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} mb-4 mx-auto`}
                  style={{ color: '#FFCC00' }} 
                />
                <h3 
                  className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-2`}
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                  className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-2 text-[#000000] dark:text-[#e8e8e8]`}
                >
                  {feature.title}
                </h3>
                <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-[#666666] dark:text-[#aaa]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`text-center ${isMobile ? 'p-5' : 'p-8'} rounded-2xl bg-[#F5F5F5] dark:bg-[#1a1a1a] max-w-3xl mx-auto mb-10`}
          >
            <h2 
              className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4`}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4 text-[#000000] dark:text-[#e8e8e8]`}
            >
              Our Mission
            </h2>
            <p 
              className="max-w-2xl mx-auto"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              className="max-w-2xl mx-auto text-[#666666] dark:text-[#aaa]"
            >
              YidVid was created to provide a safe, curated platform for Jewish families to access quality 
              kosher content. We believe everyone deserves access to inspiring, educational, and entertaining 
              videos without worrying about inappropriate content.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center justify-center gap-4 max-w-3xl mx-auto flex-wrap"
          >
            <button
              onClick={() => setShowTerms(true)}
              className={`flex items-center gap-2 ${isMobile ? 'px-4 py-2.5 text-xs' : 'px-6 py-3 text-sm'} rounded-full bg-[#F5F5F5] dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#333] font-semibold hover:border-[#FFCC00] hover:shadow-sm transition-all text-[#000000] dark:text-[#e8e8e8]`}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <FileText className="w-4 h-4" style={{ color: '#FFCC00' }} />
              Terms & Conditions
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              className={`flex items-center gap-2 ${isMobile ? 'px-4 py-2.5 text-xs' : 'px-6 py-3 text-sm'} rounded-full bg-[#F5F5F5] dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#333] font-semibold hover:border-[#FFCC00] hover:shadow-sm transition-all text-[#000000] dark:text-[#e8e8e8]`}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <ScrollText className="w-4 h-4" style={{ color: '#FFCC00' }} />
              Privacy Policy
            </button>
            <button
              onClick={() => setShowContact(true)}
              className={`flex items-center gap-2 ${isMobile ? 'px-4 py-2.5 text-xs' : 'px-6 py-3 text-sm'} rounded-full bg-[#F5F5F5] dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#333] font-semibold hover:border-[#FFCC00] hover:shadow-sm transition-all text-[#000000] dark:text-[#e8e8e8]`}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: '#FFCC00' }} />
              Contact Us
            </button>
          </motion.div>
        </div>
      </div>

      {/* Shared dialogs - same as footer/auth */}
      <TermsOfServiceDialog isOpen={showTerms} onOpenChange={setShowTerms} />
      <PrivacyPolicyDialog isOpen={showPrivacy} onOpenChange={setShowPrivacy} />
      <ContactDialog open={showContact} onOpenChange={setShowContact} />
    </>
  );
};

export default About;
