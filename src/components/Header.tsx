
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Auth from "@/pages/Auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { SearchBar } from "./header/SearchBar";
import { NotificationsMenu } from "./header/NotificationsMenu";
import { UserMenu } from "./header/UserMenu";
import { ContactDialog } from "./contact/ContactDialog";

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (initialSession) {
          console.log("Initial session loaded:", initialSession.user?.email);
          setSession(initialSession);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event);
          
          switch (event) {
            case 'SIGNED_IN':
              console.log('User signed in:', currentSession?.user?.email);
              setSession(currentSession);
              break;
              
            case 'TOKEN_REFRESHED':
              console.log('Token refreshed successfully');
              setSession(currentSession);
              break;
              
            case 'SIGNED_OUT':
              console.log('User signed out');
              setSession(null);
              navigate('/');
              break;
              
            case 'USER_UPDATED':
              console.log('User updated');
              setSession(currentSession);
              break;
              
            case 'PASSWORD_RECOVERY':
              console.log('Password recovery initiated');
              break;
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
        toast.error("There was an error with authentication. Please try logging in again.");
      }
    };

    initializeSession();
  }, [navigate]);

  const markNotificationsAsRead = async () => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from("video_notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during logout:", error);
        toast.error("There was an issue logging out");
        return;
      }
      
      setSession(null);
      navigate("/");
      toast.success("Logged out successfully");
      
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
            alt="YidVid Logo"
            className="h-12 w-auto object-contain min-h-[50px] md:min-h-[80px] max-h-[50px] md:max-h-[80px]"
            onError={(e) => {
              console.error('Logo failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>

        <div className="flex-1 flex justify-center px-2 md:px-4">
          <SearchBar />
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <ContactDialog />
          {session ? (
            <>
              <NotificationsMenu 
                session={session}
                onMarkAsRead={markNotificationsAsRead}
              />
              <UserMenu onLogout={handleLogout} />
            </>
          ) : (
            <Button 
              onClick={() => setIsAuthOpen(true)}
              className="h-7 md:h-10 text-xs md:text-sm px-2 md:px-4"
            >
              Login
            </Button>
          )}
        </div>
      </div>
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </header>
  );
};
