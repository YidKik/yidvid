
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface FetchingIssueAlertProps {
  onRefresh?: () => void;
}

export const FetchingIssueAlert = ({ onRefresh }: FetchingIssueAlertProps) => {
  return (
    <Alert variant="destructive" className="mb-4 mt-2 bg-orange-50 border-orange-200 text-orange-800">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
        <div>
          <AlertTitle className="text-orange-600 text-sm font-semibold">Attention</AlertTitle>
          <AlertDescription className="text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            Some videos may take a moment to appear. We're working on it!
          </AlertDescription>
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            className="mt-2 md:mt-0 bg-white hover:bg-orange-100 text-orange-600 border-orange-200 text-xs px-3 py-1 h-auto"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        )}
      </div>
    </Alert>
  );
};
