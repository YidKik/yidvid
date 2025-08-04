import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, HelpCircle, Video, Music, Search, Users, Bell, Shield } from "lucide-react";
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
    description: "Explore a vast collection of curated videos across multiple categories",
    icon: <Video className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Browse through different categories on the main page, use the search function to find specific content, or discover new videos through our recommendation system.",
      benefits: [
        "Access to thousands of curated videos",
        "Smart categorization for easy navigation", 
        "Personalized recommendations based on your interests",
        "Regular content updates from trusted channels"
      ],
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "music-streaming",
    title: "Music Streaming",
    description: "Enjoy high-quality music streaming with personalized playlists",
    icon: <Music className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Navigate to the music section, create custom playlists, search for your favorite artists and tracks, or explore curated music collections by genre.",
      benefits: [
        "High-quality audio streaming",
        "Custom playlist creation and management",
        "Extensive library of music across all genres",
        "Offline listening capabilities"
      ],
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "smart-search",
    title: "Smart Search",
    description: "Advanced search functionality to find exactly what you're looking for",
    icon: <Search className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Use the search bar at the top of any page. You can search by keywords, channel names, categories, or even specific topics. Use filters to narrow down results.",
      benefits: [
        "Intelligent search algorithms",
        "Advanced filtering options",
        "Search history and suggestions",
        "Cross-platform content discovery"
      ],
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "community",
    title: "Community Features",
    description: "Connect with other users and share your favorite content",
    icon: <Users className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Create your profile, follow other users, share content, leave comments, and participate in community discussions. Subscribe to channels to stay updated.",
      benefits: [
        "Interactive community platform",
        "User profiles and social features",
        "Content sharing and recommendations",
        "Community-driven content curation"
      ],
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "notifications",
    title: "Smart Notifications",
    description: "Stay updated with personalized notifications for new content",
    icon: <Bell className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Enable notifications in your settings, choose what types of updates you want to receive, and customize notification preferences for different channels and content types.",
      benefits: [
        "Real-time content updates",
        "Customizable notification preferences",
        "Channel-specific notifications",
        "Never miss your favorite content"
      ],
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "parental-controls",
    title: "Parental Controls",
    description: "Safe browsing experience with comprehensive parental control features",
    icon: <Shield className="h-8 w-8 text-primary" />,
    details: {
      howToUse: "Set up parental controls in your account settings, create PIN-protected profiles for children, and customize content filters based on age-appropriate categories.",
      benefits: [
        "PIN-protected child profiles",
        "Age-appropriate content filtering",
        "Safe browsing environment",
        "Customizable restriction levels"
      ],
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
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
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleFeatureClick(feature)}
                          className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:shadow-lg hover:border-primary/20"
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