
import { useAuth } from "@/hooks/useAuth";

export const useSessionManager = () => {
  const { session, isAuthenticated, handleLogout, isLoggingOut } = useAuth();

  return { 
    session, 
    isAuthenticated,
    handleLogout,
    isLoggingOut
  };
};
