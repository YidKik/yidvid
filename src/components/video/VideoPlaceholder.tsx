interface VideoPlaceholderProps {
  size?: 'small' | 'medium' | 'large';
}

export const VideoPlaceholder = ({ size = 'medium' }: VideoPlaceholderProps) => {
  // Minimal placeholder - just an empty container with subtle background
  // Loading is indicated by the yellow progress bar at the top
  const heightClass = size === 'small' ? 'h-32' : 
                      size === 'large' ? 'h-64' : 
                      'h-48';
  
  return (
    <div className={`${heightClass} w-full flex items-center justify-center bg-muted/10 rounded-lg`}>
      {/* Intentionally minimal - loading shown by yellow bar at top */}
    </div>
  );
};
