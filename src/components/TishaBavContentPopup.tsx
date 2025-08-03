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

// Placeholder content - will be replaced with user's data
const contentItems: ContentItem[] = [
  {
    id: '1',
    name: 'Sample Content 1',
    image: '/placeholder.svg',
    description: 'This is a sample description for the first content item. It provides meaningful entertainment for this special day.',
    link: 'https://example.com'
  },
  {
    id: '2',
    name: 'Sample Content 2', 
    image: '/placeholder.svg',
    description: 'This is a sample description for the second content item. Perfect for reflection and learning.',
    link: 'https://example.com'
  },
  {
    id: '3',
    name: 'Sample Content 3',
    image: '/placeholder.svg', 
    description: 'This is a sample description for the third content item. Engaging and thoughtful content.',
    link: 'https://example.com'
  },
  {
    id: '4',
    name: 'Sample Content 4',
    image: '/placeholder.svg',
    description: 'This is a sample description for the fourth content item. Inspiring and meaningful.',
    link: 'https://example.com'
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