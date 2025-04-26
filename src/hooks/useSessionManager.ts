
import { useAuth } from "@/hooks/useAuth";

export const useSessionManager = () => {
  const { session, isAuthenticated, handleLogout, isLoggingOut } = useAuth();

  // Add more debugging to track authentication state
  console.log("SessionManager state:", { 
    hasSession: !!session, 
    isAuthenticated, 
    userId: session?.user?.id,
    userEmail: session?.user?.email
  });

  return { 
    session, 
    isAuthenticated,
    handleLogout,
    isLoggingOut
  };
};
