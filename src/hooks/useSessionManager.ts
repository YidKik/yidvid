
import { useState } from "react";
import { useUnifiedAuth } from "./useUnifiedAuth";

export const useSessionManager = () => {
  const auth = useUnifiedAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  console.log("useSessionManager - auth state:", {
    isAuthenticated: auth.isAuthenticated,
    hasProfile: !!auth.profile,
    isLoading: auth.isLoading,
    isProfileLoading: auth.isProfileLoading
  });

  const handleSignInClick = () => {
    setIsAuthOpen(true);
  };

  return {
    session: auth.session,
    sessionData: auth.user,
    isLoading: auth.isLoading || auth.isProfileLoading,
    isAuthenticated: auth.isAuthenticated,
    profile: auth.profile,
    refreshSession: auth.refreshProfile,
    handleSignOut: auth.signOut,
    handleSignInClick,
    isAuthOpen,
    setIsAuthOpen,
    error: auth.error
  };
};
