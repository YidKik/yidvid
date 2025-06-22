
import { createContext, useContext, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { session, isLoading } = useUnifiedAuth();

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};
