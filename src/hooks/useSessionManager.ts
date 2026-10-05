
import { useState } from "react";
import { useUnifiedAuth } from "./useUnifiedAuth";
import { useAuthDialog } from "@/contexts/AuthDialogContext";

export const useSessionManager = () => {
  const auth = useUnifiedAuth();
  const sharedDialog = useAuthDialog();
  const [localAuthOpen, setLocalAuthOpen] = useState(false);
  const isAuthOpen = sharedDialog ? sharedDialog.isAuthOpen : localAuthOpen;
  const setIsAuthOpen = sharedDialog ? sharedDialog.setIsAuthOpen : setLocalAuthOpen;

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
