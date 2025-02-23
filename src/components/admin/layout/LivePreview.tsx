
import { useState, useEffect } from 'react';
import { LayoutConfig } from './types';
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { CategorySection } from "@/components/categories/CategorySection";
import { ContentToggle } from "@/components/content/ContentToggle";
import { MusicSection } from "@/components/content/MusicSection";
import { VideoContent } from "@/components/content/VideoContent";
import { useVideos } from "@/hooks/video/useVideos";
import { useIsMobile } from "@/hooks/useIsMobile";
import { GlobalNotification } from "@/components/notifications/GlobalNotification";

interface LivePreviewProps {
  sections: LayoutConfig[];
  onSelectSection: (sectionId: string) => void;
  selectedSectionId: string | null;
}

export const LivePreview = ({ sections, onSelectSection, selectedSectionId }: LivePreviewProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMusic, setIsMusic] = useState(false);
  const { data: videos, isLoading } = useVideos();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sortedSections = [...sections].sort((a, b) => 
    isMobile ? a.mobile_order - b.mobile_order : a.desktop_order - b.desktop_order
  );

  const getSectionContent = (sectionName: string) => {
    switch (sectionName) {
      case 'Header Navigation':
        return (
          <div className="w-full">
            <Header />
          </div>
        );
      case 'Categories':
        return <CategorySection />;
      case 'Content Toggle':
        return <ContentToggle isMusic={isMusic} onToggle={() => setIsMusic(!isMusic)} />;
      case 'Video Content':
        return !isMusic ? <VideoContent videos={videos || []} isLoading={isLoading} /> : null;
      case 'Music Content':
        return isMusic ? <MusicSection /> : null;
      case 'Notifications':
        return <GlobalNotification />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
      <div className="space-y-4">
        {sortedSections.map(section => {
          if ((isMobile && !section.visibility.mobile) || 
              (!isMobile && !section.visibility.desktop)) {
            return null;
          }

          const sectionContent = getSectionContent(section.name);
          if (!sectionContent) return null;

          return (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={cn(
                "relative transition-all cursor-pointer w-full",
                section.spacing.marginTop,
                section.spacing.marginBottom,
                section.spacing.padding,
                selectedSectionId === section.id && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {/* Section Content */}
              <div className="w-full">
                {sectionContent}
              </div>

              {/* Selection Overlay */}
              <div 
                className={cn(
                  "absolute inset-0 border-2 border-dashed pointer-events-none transition-opacity",
                  selectedSectionId === section.id ? "border-primary opacity-100" : "border-transparent opacity-0 hover:opacity-50"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
