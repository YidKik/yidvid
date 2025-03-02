
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
          <Shield className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Channel Control</h3>
            <p className="text-sm text-gray-600 mt-1">
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
                className="flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <Lock className="h-4 w-4" />
                <span>Unlock Controls</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={onLock}
                className="flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <Unlock className="h-4 w-4" />
                <span>Lock Controls</span>
              </Button>
            )
          ) : (
            <Button 
              variant="outline" 
              onClick={onShowSetPinDialog}
              className="flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <Lock className="h-4 w-4" />
              <span>Set Parental Lock</span>
            </Button>
          )}
        </div>
      </div>

      <Alert className="bg-[#F1F0FB] border-gray-200 text-sm">
        <AlertDescription className="text-gray-700">
          Use the toggles below to manage your channel preferences. When a channel is marked as "Allowed", 
          its content will appear in your feed.
        </AlertDescription>
      </Alert>
    </>
  );
};
