import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Heart, Shield, Users, RefreshCw, FileText, ScrollText, MessageSquare } from "lucide-react";
import { ContactDialog } from "@/components/contact/ContactDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

      <div className="min-h-screen bg-white pt-14 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
        <div className={`max-w-4xl mx-auto ${isMobile ? 'px-4 py-8' : 'px-6 py-12'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 
              className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold mb-4`}
              style={{ fontFamily: "'Fredoka One', 'Nunito', sans-serif", color: '#000000' }}
            >
              About YidVid
            </h1>
            <p 
              className={`${isMobile ? 'text-base' : 'text-lg'} max-w-2xl mx-auto`}
              style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}
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
                className={`${isMobile ? 'p-4' : 'p-6'} rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] text-center`}
              >
                <feature.icon 
                  className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} mb-4 mx-auto`}
                  style={{ color: '#FFCC00' }} 
                />
                <h3 
                  className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-2`}
                  style={{ fontFamily: "'Quicksand', sans-serif", color: '#000000' }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`text-center ${isMobile ? 'p-5' : 'p-8'} rounded-2xl bg-[#F5F5F5] max-w-3xl mx-auto mb-10`}
          >
            <h2 
              className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4`}
              style={{ fontFamily: "'Quicksand', sans-serif", color: '#000000' }}
            >
              Our Mission
            </h2>
            <p 
              className="max-w-2xl mx-auto"
              style={{ fontFamily: "'Quicksand', sans-serif", color: '#666666' }}
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
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] font-semibold text-sm hover:border-[#FFCC00] hover:shadow-sm transition-all"
              style={{ fontFamily: "'Quicksand', sans-serif", color: '#000000' }}
            >
              <FileText className="w-4 h-4" style={{ color: '#FFCC00' }} />
              Terms & Conditions
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] font-semibold text-sm hover:border-[#FFCC00] hover:shadow-sm transition-all"
              style={{ fontFamily: "'Quicksand', sans-serif", color: '#000000' }}
            >
              <ScrollText className="w-4 h-4" style={{ color: '#FFCC00' }} />
              Privacy Policy
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] font-semibold text-sm hover:border-[#FFCC00] hover:shadow-sm transition-all"
              style={{ fontFamily: "'Quicksand', sans-serif", color: '#000000' }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: '#FFCC00' }} />
              Contact Us
            </button>
          </motion.div>
        </div>
      </div>

      {/* Terms & Conditions Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-white rounded-2xl border border-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Quicksand', sans-serif", color: '#000000' }}>
              Terms & Conditions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm" style={{ fontFamily: "'Quicksand', sans-serif", color: '#333333' }}>
            <p><strong>Last updated:</strong> February 2026</p>
            <p>Welcome to YidVid. By using our platform, you agree to the following terms:</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>1. Use of Service</h3>
            <p>YidVid provides curated kosher video content. The platform is free to use and intended for family-friendly viewing. You agree not to misuse the service or attempt to access content through unauthorized means.</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>2. Content</h3>
            <p>All videos on YidVid are sourced from public YouTube channels. We curate and filter content to maintain kosher standards but do not claim ownership of any third-party content.</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>3. User Accounts</h3>
            <p>Creating an account allows you to save favorites, create playlists, and interact with the community. You are responsible for maintaining the security of your account credentials.</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>4. Acceptable Use</h3>
            <p>Users must not post inappropriate comments, harass other users, or use the platform for any unlawful purpose. We reserve the right to remove content or accounts that violate these terms.</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>5. Changes</h3>
            <p>We may update these terms from time to time. Continued use of YidVid after changes constitutes acceptance of the updated terms.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-white rounded-2xl border border-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Quicksand', sans-serif", color: '#000000' }}>
              Privacy Policy
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm" style={{ fontFamily: "'Quicksand', sans-serif", color: '#333333' }}>
            <p><strong>Last updated:</strong> February 2026</p>
            <p>Your privacy is important to us. This policy explains how YidVid handles your information.</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>1. Information We Collect</h3>
            <p>We collect only the information necessary to provide our service: email address for account creation, viewing preferences, and interaction data (favorites, playlists, watch history).</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>2. How We Use Your Information</h3>
            <p>Your information is used to personalize your experience, save your preferences, and improve our platform. We do not sell or share your personal data with third parties for marketing purposes.</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>3. Data Storage</h3>
            <p>Your data is securely stored using industry-standard encryption. We use Supabase for data management, which provides enterprise-grade security.</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>4. Cookies</h3>
            <p>We use essential cookies to maintain your session and preferences. No third-party tracking cookies are used.</p>
            <h3 className="font-bold text-base" style={{ color: '#000000' }}>5. Your Rights</h3>
            <p>You can request deletion of your account and associated data at any time through the Settings page. Contact us if you have any questions about your data.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <ContactDialog open={showContact} onOpenChange={setShowContact} />
    </>
  );
};

export default About;
