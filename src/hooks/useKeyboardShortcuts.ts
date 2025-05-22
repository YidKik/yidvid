
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { session, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl key is pressed
      if (event.ctrlKey) {
        // Only capture our specific shortcuts
        if (['s', 'd', 'h', 'v'].includes(event.key.toLowerCase())) {
          // Prevent the default browser behavior (like Ctrl+S for save)
          event.preventDefault();
          
          // Handle different shortcuts
          switch (event.key.toLowerCase()) {
            case 's':
              if (!event.shiftKey) {
                // Ctrl+S => Settings
                navigate('/settings');
                toast.success('Navigated to Settings');
              }
              break;
            case 'd':
              // Ctrl+D => Admin Dashboard
              navigate('/dashboard');
              toast.success('Navigated to Dashboard');
              break;
            case 'h':
              // Ctrl+H => Home
              navigate('/');
              toast.success('Navigated to Home');
              break;
            case 'v':
              // Ctrl+V => Videos
              navigate('/videos');
              toast.success('Navigated to Videos');
              break;
          }
        }
      }
      
      // Check for Ctrl+Shift+S (sign in popup)
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        // We'll use a custom event to trigger the auth dialog
        document.dispatchEvent(new CustomEvent('openAuthDialog'));
        toast.success('Opening Sign In');
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return null;
};
