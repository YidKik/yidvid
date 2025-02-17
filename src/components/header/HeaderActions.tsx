
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface HeaderActionsProps {
  isMobile: boolean;
  isSearchExpanded: boolean;
  session: any;
  onSearchExpand: () => void;
  onAuthOpen: () => void;
}

export const HeaderActions = ({
  isMobile,
  isSearchExpanded,
  onSearchExpand,
  onAuthOpen,
  session
}: HeaderActionsProps) => {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {isMobile && !isSearchExpanded ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchExpand}
          className="mr-1"
        >
          <ChevronDown className="h-5 w-5 text-gray-600" />
        </Button>
      ) : null}

      {!session && (
        <Button 
          onClick={onAuthOpen}
          className="h-8 text-sm px-3"
          variant="default"
        >
          Login
        </Button>
      )}
    </div>
  );
};
