import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarContextType {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SIDEBAR_EXPANDED_WIDTH = 200;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isDesktop } = useIsMobile();
  const isHomePage = location.pathname === "/";
  const [isExpanded, setIsExpanded] = useState(!isHomePage);

  // Update expanded state when route changes
  useEffect(() => {
    if (isHomePage) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isHomePage]);

  // On mobile/tablet, sidebar width is always 0 (sidebar is hidden)
  const sidebarWidth = !isDesktop ? 0 : isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
};
