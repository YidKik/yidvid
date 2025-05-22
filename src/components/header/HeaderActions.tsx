
import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { ContactDialog } from "../contact/ContactDialog";
import { LogIn, MessageSquare, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileHeaderActions } from "./actions/MobileHeaderActions";
import { DesktopHeaderActions } from "./actions/DesktopHeaderActions";

interface HeaderActionsProps {
  isMobile: boolean;
  isSearchExpanded: boolean;
  session: any;
  onSearchExpand: () => void;
  onAuthOpen: () => void;
  onLogout: () => Promise<void>;
  onMarkNotificationsAsRead: () => Promise<void>;
  onSettingsClick?: () => void;
}

export const HeaderActions = ({
  isMobile,
  isSearchExpanded,
  session,
  onSearchExpand,
  onAuthOpen,
  onLogout,
  onMarkNotificationsAsRead,
  onSettingsClick
}: HeaderActionsProps) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate("/settings");
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  if (isMobile) {
    return (
      <MobileHeaderActions
        session={session}
        onAuthOpen={onAuthOpen}
        onMarkNotificationsAsRead={onMarkNotificationsAsRead}
        handleSettingsClick={handleSettingsClick}
        onLogout={onLogout}
      />
    );
  }

  return (
    <DesktopHeaderActions
      session={session}
      onAuthOpen={onAuthOpen}
      onLogout={onLogout}
      onMarkNotificationsAsRead={onMarkNotificationsAsRead}
      handleSettingsClick={handleSettingsClick}
    />
  );
};
