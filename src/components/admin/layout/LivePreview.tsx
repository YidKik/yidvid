
import { useState, useEffect } from 'react';
import { LayoutConfig } from './types';
import { cn } from "@/lib/utils";

interface LivePreviewProps {
  sections: LayoutConfig[];
  onSelectSection: (sectionId: string) => void;
  selectedSectionId: string | null;
}

export const LivePreview = ({ sections, onSelectSection, selectedSectionId }: LivePreviewProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sortedSections = [...sections].sort((a, b) => 
    isMobile ? a.mobile_order - b.mobile_order : a.desktop_order - b.desktop_order
  );

  return (
    <div className="space-y-4">
      {sortedSections.map(section => {
        if ((isMobile && !section.visibility.mobile) || 
            (!isMobile && !section.visibility.desktop)) {
          return null;
        }

        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            className={cn(
              "relative rounded-lg transition-all cursor-pointer",
              section.spacing.marginTop,
              section.spacing.marginBottom,
              section.spacing.padding,
              selectedSectionId === section.id && "ring-2 ring-primary ring-offset-2"
            )}
          >
            {/* Section Content Preview */}
            <div className="min-h-[100px]">
              {/* Example content based on section type */}
              {section.name === 'Header Navigation' && (
                <nav className="flex justify-between items-center bg-white p-4">
                  <div className="text-xl font-bold">Logo</div>
                  <div className="flex gap-4">
                    <span>Home</span>
                    <span>About</span>
                    <span>Contact</span>
                  </div>
                </nav>
              )}
              
              {section.name === 'Featured Content' && (
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">Featured Content</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded shadow">Featured Item 1</div>
                    <div className="bg-white p-4 rounded shadow">Featured Item 2</div>
                  </div>
                </div>
              )}

              {section.name === 'Categories Section' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-100 p-4 rounded">Category 1</div>
                  <div className="bg-green-100 p-4 rounded">Category 2</div>
                  <div className="bg-yellow-100 p-4 rounded">Category 3</div>
                </div>
              )}

              {section.name === 'Latest Videos' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-200 aspect-video rounded"></div>
                  <div className="bg-gray-200 aspect-video rounded"></div>
                  <div className="bg-gray-200 aspect-video rounded"></div>
                </div>
              )}

              {section.name === 'Traffic Control' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800">Traffic Status</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-green-100 p-2 rounded">Low Traffic</div>
                    <div className="bg-red-100 p-2 rounded">High Traffic</div>
                  </div>
                </div>
              )}

              {section.name === 'Footer' && (
                <footer className="bg-gray-800 text-white p-6 rounded-lg">
                  <div className="grid grid-cols-3 gap-8">
                    <div>About Us</div>
                    <div>Links</div>
                    <div>Contact</div>
                  </div>
                </footer>
              )}
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
  );
};
