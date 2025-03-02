
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FetchingIssueAlert = () => {
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertDescription className="text-sm text-amber-700">
        We're aware of some slowness when loading videos and are actively working to resolve these issues. Thank you for your patience!
      </AlertDescription>
    </Alert>
  );
};
