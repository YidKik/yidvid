import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Heart, Shield, Users, RefreshCw, FileText, ScrollText, MessageSquare } from "lucide-react";
import { ContactDialog } from "@/components/contact/ContactDialog";
import { TermsOfServiceDialog } from "@/components/auth/TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "@/components/auth/PrivacyPolicyDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

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

      <div className="min-h-screen bg-white dark:bg-background pt-14 pl-0 lg:pl-[var(--sidebar-w)] pb-nav lg:pb-0 transition-all duration-300">
        <div className={`max-w-4xl mx-auto ${isMobile ? 'px-4 py-8' : 'px-6 py-12'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 
              className={`type-h1 mb-4 text-foreground dark:text-foreground`}
            >
              About YidVid
            </h1>
            <p 
              className={`${isMobile ? 'text-base' : 'text-lg'} max-w-2xl mx-auto text-muted-foreground dark:text-muted-foreground`}
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
                className={`${isMobile ? 'p-4' : 'p-6'} rounded-card bg-white dark:bg-card border border-border dark:border-border text-center shadow-sm hover:shadow-md transition-shadow duration-300 hover:border-brand dark:hover:border-brand`}
              >
                <feature.icon 
                  className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} mb-4 mx-auto`}
                  style={{ color: 'hsl(var(--brand))' }} 
                />
                <h3 
                  className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-2 text-foreground dark:text-foreground`}
                >
                  {feature.title}
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`text-center ${isMobile ? 'p-5' : 'p-8'} rounded-card bg-white dark:bg-card border-2 border-brand/30 dark:border-brand/20 max-w-3xl mx-auto mb-10 shadow-sm`}
          >
            <h2 
              className={`type-h2 mb-4 text-foreground dark:text-foreground`}
            >
              Our Mission
            </h2>
            <p 
              className="max-w-2xl mx-auto text-muted-foreground dark:text-muted-foreground"
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
            <Button variant="ghost"
              onClick={() => setShowTerms(true)}
              className="h-11 px-4 sm:px-6 type-label rounded-control bg-muted dark:bg-card border border-border font-semibold hover:border-brand text-foreground"
            >
              <FileText className="w-4 h-4" style={{ color: 'hsl(var(--brand))' }} />
              Terms & Conditions
            </Button>
            <Button variant="ghost"
              onClick={() => setShowPrivacy(true)}
              className="h-11 px-4 sm:px-6 type-label rounded-control bg-muted dark:bg-card border border-border font-semibold hover:border-brand text-foreground"
            >
              <ScrollText className="w-4 h-4" style={{ color: 'hsl(var(--brand))' }} />
              Privacy Policy
            </Button>
            <Button variant="ghost"
              onClick={() => setShowContact(true)}
              className="h-11 px-4 sm:px-6 type-label rounded-control bg-muted dark:bg-card border border-border font-semibold hover:border-brand text-foreground"
            >
              <MessageSquare className="w-4 h-4" style={{ color: 'hsl(var(--brand))' }} />
              Contact Us
            </Button>
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
