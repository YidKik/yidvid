import { createContext, useContext, useState, ReactNode } from "react";
import Auth from "@/pages/Auth";

type AuthDialogContextType = {
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
};

const AuthDialogContext = createContext<AuthDialogContextType | null>(null);

export const useAuthDialog = () => useContext(AuthDialogContext);

/** Single shared sign-in dialog for page-level "Sign In" buttons. */
export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  return (
    <AuthDialogContext.Provider value={{ isAuthOpen, setIsAuthOpen }}>
      {children}
      <Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </AuthDialogContext.Provider>
  );
};
