
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { session, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl+Shift keys are pressed
      if (event.ctrlKey && event.shiftKey) {
        // Only capture our specific shortcuts
        if (['s', 'd', 'h', 'v'].includes(event.key.toLowerCase())) {
          // Prevent the default browser behavior
          event.preventDefault();
          
          // Handle different shortcuts
          switch (event.key.toLowerCase()) {
            case 's':
              // Ctrl+Shift+S => Settings
              navigate('/settings');
              toast.success('Navigated to Settings');
              break;
            case 'd':
              // Ctrl+Shift+D => Admin Dashboard
              navigate('/dashboard');
              toast.success('Navigated to Dashboard');
              break;
            case 'h':
              // Ctrl+Shift+H => Home
              navigate('/');
              toast.success('Navigated to Home');
              break;
            case 'v':
              // Ctrl+Shift+V => Videos
              navigate('/videos');
              toast.success('Navigated to Videos');
              break;
          }
        }
      }
      
      // Check for Ctrl+Shift+A (auth dialog)
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
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
