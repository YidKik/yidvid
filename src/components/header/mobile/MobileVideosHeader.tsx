import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { VideoSearchBar } from "../VideoSearchBar";
import { CategoryToggle } from "../CategoryToggle";
import { NotificationsMenu } from "../NotificationsMenu";
import { Link } from "react-router-dom";
import { Settings, LogIn } from "lucide-react";

interface MobileVideosHeaderProps {
  session: any;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  onAuthOpen: () => void;
  handleSettingsClick: () => void;
  onMarkNotificationsAsRead: () => Promise<void>;
}

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
            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
              className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>


      {/* Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[280px] bg-background text-foreground">
          <SheetHeader>
            <SheetTitle className="text-left text-foreground">Menu</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {session ? (
              <>
                {/* Notifications */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Notifications</span>
                  <NotificationsMenu onMarkAsRead={onMarkNotificationsAsRead} />
                </div>

                {/* Settings */}
                <Button
                  onClick={() => {
                    handleSettingsClick();
                    setIsMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start gap-2"
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
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Categories</p>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "ghost"}
                    onClick={() => {
                      onCategoryChange("all");
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    All Videos
                  </Button>
                  <Button
                    variant={selectedCategory === "kosher" ? "default" : "ghost"}
                    onClick={() => {
                      onCategoryChange("kosher");
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Kosher
                  </Button>
                  <Button
                    variant={selectedCategory === "news" ? "default" : "ghost"}
                    onClick={() => {
                      onCategoryChange("news");
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    News
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
