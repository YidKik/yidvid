
import { Shield, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChannelControlHeaderProps {
  isLocked: boolean;
  storedPin: string;
  onLock: () => void;
  onShowLockDialog: () => void;
  onShowSetPinDialog: () => void;
}

export const ChannelControlHeader = ({
  isLocked,
  storedPin,
  onLock,
  onShowLockDialog,
  onShowSetPinDialog
}: ChannelControlHeaderProps) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-start gap-3">
          <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Channel Control</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Customize your viewing experience by selecting which channels you want to include in your feed.
            </p>
          </div>
        </div>
        <div className="w-full md:w-auto">
          {storedPin ? (
            isLocked ? (
              <Button 
                variant="outline" 
                onClick={onShowLockDialog}
                className="flex items-center gap-2 w-full md:w-auto justify-center text-xs md:text-sm py-1.5 px-3 h-auto md:h-9"
              >
                <Lock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>Unlock Controls</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={onLock}
                className="flex items-center gap-2 w-full md:w-auto justify-center text-xs md:text-sm py-1.5 px-3 h-auto md:h-9"
              >
                <Unlock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>Lock Controls</span>
              </Button>
            )
          ) : (
            <Button 
              variant="outline" 
              onClick={onShowSetPinDialog}
              className="flex items-center gap-2 w-full md:w-auto justify-center text-xs md:text-sm py-1.5 px-3 h-auto md:h-9"
            >
              <Lock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span>Set Parental Lock</span>
            </Button>
          )}
        </div>
      </div>

      <Alert className="bg-[#F1F0FB] border-gray-200 text-xs md:text-sm py-2 px-3 md:py-3 md:px-4">
        <AlertDescription className="text-gray-700 text-xs md:text-sm">
          Use the toggles below to manage your channel preferences. When a channel is marked as "Allowed", 
          its content will appear in your feed.
        </AlertDescription>
      </Alert>
    </>
  );
};
