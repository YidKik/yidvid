import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, HelpCircle, Video, Search, Users, Bell, Shield, Settings, Heart } from "lucide-react";
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: {
    howToUse: string;
    benefits: string[];
    image: string;
  };
}

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const features: FeatureCard[] = [
  {
    id: "video-discovery",
    title: "Video Discovery",
    description: "Browse curated Jewish educational and entertainment content",
    icon: <Video className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Navigate through our organized categories like Torah classes, Jewish history, holidays, and family content. Use the category filters to find content that matches your interests and learning level.",
      benefits: [
        "Carefully curated Jewish content",
        "Educational and entertaining videos", 
        "Content suitable for all ages",
        "Regular updates from trusted educators"
      ],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "smart-search",
    title: "Smart Search",
    description: "Find specific topics, rabbis, or Jewish content quickly",
    icon: <Search className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Use our search bar to find videos by topic (like 'Shabbat', 'Passover'), rabbi names, or specific Jewish concepts. Filter results by content type, duration, or difficulty level.",
      benefits: [
        "Search in Hebrew and English",
        "Topic-based filtering",
        "Find content by specific rabbis",
        "Quick access to relevant videos"
      ],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "settings",
    title: "Settings & Preferences",
    description: "Customize your learning experience and preferences",
    icon: <Settings className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Access settings from your profile to set video quality, enable subtitles, choose preferred languages (Hebrew/English), and configure content filters for your family.",
      benefits: [
        "Multi-language support",
        "Video quality controls",
        "Subtitle preferences",
        "Family-friendly content filters"
      ],
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "smart-subscribe",
    title: "Smart Subscribe",
    description: "Subscribe to your favorite rabbis and content creators",
    icon: <Users className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Click the subscribe button on any channel page to follow your favorite rabbis and educators. Get notified when they upload new content and access their complete video libraries.",
      benefits: [
        "Follow your favorite teachers",
        "Get notified of new uploads",
        "Access complete channel libraries",
        "Personalized content recommendations"
      ],
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "notifications",
    title: "Smart Notifications",
    description: "Stay updated with new Jewish content and learning opportunities",
    icon: <Bell className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Enable notifications to get updates when subscribed channels upload new content, when there are special holiday programs, or when new educational series begin.",
      benefits: [
        "New content alerts",
        "Holiday and special event notifications",
        "Weekly learning schedule updates",
        "Customizable notification frequency"
      ],
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "parental-controls",
    title: "Family Safe Viewing",
    description: "Ensure age-appropriate content for your entire family",
    icon: <Shield className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Set up family profiles with age-appropriate content filters. Create PIN-protected adult accounts and child-safe viewing modes that automatically filter content suitable for different age groups.",
      benefits: [
        "Age-appropriate content filtering",
        "Family-friendly viewing modes",
        "PIN-protected parental controls",
        "Safe learning environment for children"
      ],
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80"
    }
  }
];

const FeatureDetail: React.FC<{ 
  feature: FeatureCard; 
  onBack: () => void; 
}> = ({ feature, onBack }) => {
  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col p-2 md:p-4 space-y-3 md:space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Features
      </button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {feature.icon}
          <h3 className="text-xl md:text-2xl font-bold">{feature.title}</h3>
        </div>

        <img
          src={feature.details.image}
          alt={feature.title}
          className="w-full h-32 md:h-48 object-cover rounded-lg"
        />

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg mb-2">How to Use</h4>
            <p className="text-muted-foreground leading-relaxed">
              {feature.details.howToUse}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-2">Benefits</h4>
            <ul className="space-y-2">
              {feature.details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TishaBavContentPopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null);

  const handleFeatureClick = (feature: FeatureCard) => {
    setSelectedFeature(feature);
  };

  const handleBack = () => {
    setSelectedFeature(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl w-[95vw] h-[80vh] p-0 overflow-hidden"
        hideCloseButton
      >
        <div className="relative h-full bg-gradient-to-br from-background to-muted/20">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Welcome to YidVid!
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Your all-in-one platform for video content discovery
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors shadow-md"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 h-[calc(100%-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
            <AnimatePresence mode="wait">
              {selectedFeature ? (
                <FeatureDetail key="detail" feature={selectedFeature} onBack={handleBack} />
              ) : (
                <motion.div
                  key="main"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Site Description */}
                  <div className="text-center space-y-4 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Discover, Stream, Connect
                    </h3>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      YidVid is your comprehensive platform for discovering amazing video content, streaming high-quality music, 
                      and connecting with a vibrant community. Whether you're looking for educational content, entertainment, 
                      or inspiration, we've got everything you need in one place.
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Explore Our Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {features.map((feature, index) => (
                        <motion.div
                          key={feature.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.15, type: "spring", stiffness: 300, damping: 20 }}
                          whileHover={{ 
                            scale: 1.03, 
                            y: -5,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            transition: { type: "spring", stiffness: 400, damping: 10 }
                          }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleFeatureClick(feature)}
                          className="p-5 border border-border rounded-xl cursor-pointer bg-gradient-to-br from-background to-muted/10 hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 hover:border-primary/30 shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              {feature.icon}
                              <h4 className="font-semibold">{feature.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {feature.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-primary font-medium">
                              <span>Learn more</span>
                              <ArrowLeft className="h-3 w-3 rotate-180" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="text-center space-y-4 p-6 bg-muted/30 rounded-xl">
                    <h3 className="text-lg font-semibold">Ready to Get Started?</h3>
                    <p className="text-muted-foreground">
                      Click on any feature above to learn more about how it works and how it can enhance your experience on YidVid.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};