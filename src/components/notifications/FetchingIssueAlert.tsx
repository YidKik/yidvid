
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FetchingIssueAlert = () => {
  return (
    <Alert className="mb-4 bg-white border-2 border-black">
      <AlertTriangle className="h-4 w-4 text-black" />
      <AlertDescription className="text-sm text-black font-medium">
        We're aware of some slowness when loading videos and are actively working to resolve these issues. Thank you for your patience!
      </AlertDescription>
    </Alert>
  );
};
