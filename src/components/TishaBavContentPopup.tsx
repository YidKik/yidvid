import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ContentItem {
  id: string;
  name: string;
  image: string;
  description: string;
  link: string;
}

interface TishaBavContentPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tisha B'av content with actual images and links
const contentItems: ContentItem[] = [
  {
    id: '1',
    name: 'Mostly Music',
    image: '/lovable-uploads/0af85e42-46da-4c1c-945b-b8dd8dfe0d46.png',
    description: 'Discover beautiful Jewish music and content perfect for reflection during Tisha B\'av. A comprehensive collection of meaningful songs and spiritual content.',
    link: 'https://mostlymusic.com/'
  },
  {
    id: '2',
    name: 'Torah Anytime - Tisha B\'av 2025',
    image: '/lovable-uploads/4deb8072-6c34-40f8-8862-d37dcfe70c8f.png',
    description: '25 Life-Changing Hours - Join 700K+ viewers across 120+ cities with 60+ speakers for an absolutely FREE Tisha B\'av experience.',
    link: '#' // Placeholder - waiting for link
  },
  {
    id: '3',
    name: 'Hidden Courage',
    image: '/lovable-uploads/77f41bcc-ffde-4140-a4c2-c8a91853c329.png',
    description: 'A powerful Tisha B\'av original film by Yad L\'Achim. Experience stories of courage and faith during challenging times.',
    link: '#' // Placeholder - waiting for link
  },
  {
    id: '4',
    name: 'Chofetz Chaim Heritage Foundation',
    image: '/lovable-uploads/04f9fa7e-128e-4d18-9758-066ed3f78e6c.png',
    description: 'Inspiring content and teachings from the Chofetz Chaim Heritage Foundation, focusing on character development and spiritual growth.',
    link: '#' // Placeholder - waiting for link
  },
  {
    id: '5',
    name: 'Hidden Light',
    image: '/lovable-uploads/5c4096e3-490d-4ad8-bd25-ae9da5ba7c7f.png',
    description: 'Uncovering the Vatican\'s Darkest Secret - A compelling documentary exploring hidden historical truths and their relevance today.',
    link: '#' // Placeholder - waiting for link
  },
  {
    id: '6',
    name: 'Bounce Back',
    image: '/lovable-uploads/6b380080-c99b-4d32-b9d6-41abe2393426.png',
    description: 'Project Inspire presents an uplifting story about a basketball team that rose to the top, demonstrating how we can lift each other higher.',
    link: '#' // Placeholder - waiting for link
  },
  {
    id: '7',
    name: 'The Yizkor Foundation',
    image: '/lovable-uploads/e38fc853-d773-470e-9512-c12f56a9296d.png',
    description: 'Meaningful memorial and remembrance content from The Yizkor Foundation, helping preserve memory and honor those we\'ve lost.',
    link: '#' // Placeholder - waiting for link
  }
];

const ContentCard: React.FC<{ item: ContentItem; onClick: () => void }> = ({ item, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card rounded-xl shadow-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground text-center group-hover:text-primary transition-colors">
          {item.name}
        </h3>
      </div>
    </motion.div>
  );
};

const ContentDetail: React.FC<{ item: ContentItem; onBack: () => void }> = ({ item, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col"
    >
      <button
        onClick={onBack}
        className="self-start mb-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to content
      </button>
      
      <div className="flex-1 space-y-6">
        <div className="aspect-video overflow-hidden rounded-lg">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">{item.name}</h2>
          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          
          <motion.a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Visit Site
            <ExternalLink size={16} />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export const TishaBavContentPopup: React.FC<TishaBavContentPopupProps> = ({ isOpen, onClose }) => {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const handleCardClick = (item: ContentItem) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-[95vw] h-[85vh] p-0 overflow-hidden"
        hideCloseButton
      >
        <div className="relative h-full bg-gradient-to-br from-background to-muted/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Special Tisha B'Av Content
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Meaningful content for reflection and learning
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <ContentDetail key="detail" item={selectedItem} onBack={handleBack} />
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                >
                  {contentItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ContentCard item={item} onClick={() => handleCardClick(item)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};