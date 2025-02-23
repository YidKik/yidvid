
import { LayoutConfig } from './types';

interface LivePreviewProps {
  sections: LayoutConfig[];
}

export const LivePreview = ({ sections }: LivePreviewProps) => {
  // Sort sections by order based on viewport
  const isMobile = window.innerWidth < 768;
  const sortedSections = [...sections].sort((a, b) => 
    isMobile 
      ? a.mobile_order - b.mobile_order
      : a.desktop_order - b.desktop_order
  );

  return (
    <div className="space-y-4">
      {sortedSections.map(section => {
        // Skip sections that are hidden for current viewport
        if ((isMobile && !section.visibility.mobile) || 
            (!isMobile && !section.visibility.desktop)) {
          return null;
        }

        return (
          <div
            key={section.id}
            className={`
              bg-white rounded-lg border-2 border-dashed border-gray-300
              ${section.spacing.marginTop}
              ${section.spacing.marginBottom}
              ${section.spacing.padding}
            `}
          >
            <div className="min-h-[100px] flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Order: {isMobile ? section.mobile_order : section.desktop_order}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
