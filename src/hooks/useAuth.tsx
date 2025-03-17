
import { useAuthentication } from "./useAuthentication";

export const useAuth = () => {
  const {
    session,
    isAuthenticated,
    isLoggingOut,
    signOut: handleLogout
  } = useAuthentication();

  return {
    session,
    isAuthenticated,
    handleLogout,
    isLoggingOut
  };
};
