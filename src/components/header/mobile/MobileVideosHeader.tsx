import { useState } from "react";
import { Search, Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { VideoSearchBar } from "../VideoSearchBar";
import { Link, useNavigate } from "react-router-dom";
import { Settings, LogIn } from "lucide-react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationHeader } from "@/components/notifications/NotificationHeader";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface MobileVideosHeaderProps {
  session: any;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  onAuthOpen: () => void;
  handleSettingsClick: () => void;
  onMarkNotificationsAsRead: () => Promise<void>;
}

const categories = [
  { id: 'all', label: 'All Videos' },
  { id: 'music', label: 'Music' },
  { id: 'torah', label: 'Torah' },
  { id: 'inspiration', label: 'Inspiration' },
  { id: 'podcast', label: 'Podcasts' },
  { id: 'education', label: 'Education' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'other', label: 'Other' },
];

export const MobileVideosHeader = ({
  session,
  selectedCategory,
  onCategoryChange,
  onAuthOpen,
  handleSettingsClick,
  onMarkNotificationsAsRead
}: MobileVideosHeaderProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();
  const { 
    notifications, 
    isLoading: notificationsLoading, 
    isError, 
    refetch,
    handleClearAll,
    handleClose 
  } = useNotifications(user?.id);

  return (
    <>
      <div className="flex items-center justify-between w-full px-3 h-14">
        {/* Left: Logo or Search */}
        {!isSearchExpanded ? (
          <Link to="/" className="flex items-center">
            <img 
              src="/yidkik-logo.png" 
              alt="YidVid Logo" 
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.src = "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png";
              }} 
            />
          </Link>
        ) : (
          <div className="flex-1 mr-2">
            <VideoSearchBar />
          </div>
        )}

        {/* Right: Search/Close and Menu buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-primary"
          >
            {isSearchExpanded ? (
              <X className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>

          {!isSearchExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-primary"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>


      {/* Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[280px] bg-gray-50">
          <SheetHeader>
            <SheetTitle className="text-left text-gray-900">Menu</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {session ? (
              <>
                {/* Notifications */}
                <Button
                  onClick={() => {
                    setIsNotificationsOpen(true);
                    setIsMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-900 hover:bg-gray-200"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Button>

                {/* Settings */}
                <Button
                  onClick={() => {
                    navigate('/settings');
                    setIsMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-900 hover:bg-gray-200"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  onAuthOpen();
                  setIsMenuOpen(false);
                }}
                variant="default"
                className="w-full gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}

            {/* Category Selection - Only show if category props are available */}
            {selectedCategory && onCategoryChange && (
              <div className="pt-4 border-t border-gray-300">
                <p className="text-sm font-medium mb-3 text-gray-900">Categories</p>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      onClick={() => {
                        onCategoryChange(category.id);
                        setIsMenuOpen(false);
                      }}
                      className={selectedCategory === category.id 
                        ? "w-full justify-start" 
                        : "w-full justify-start text-gray-900 hover:bg-gray-200"}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Notifications Sheet */}
      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent side="right" className="w-[320px] sm:w-[400px] bg-background p-0">
          <div className="flex flex-col h-full">
            <NotificationHeader 
              hasNotifications={!!notifications?.length}
              onClearAll={handleClearAll}
              onClose={() => setIsNotificationsOpen(false)}
            />
            <div className="flex-1 overflow-y-auto">
              <NotificationList
                notifications={notifications || []}
                isLoading={notificationsLoading}
                isError={isError}
                onRetry={() => refetch()}
                onNotificationClick={() => setIsNotificationsOpen(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
