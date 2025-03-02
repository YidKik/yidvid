
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FetchingIssueAlert = () => {
  return (
    <Alert className="mb-4 bg-white border border-gray-200 shadow-sm">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertDescription className="text-sm text-gray-700 font-medium">
        Loading videos may take a moment. We're working to enhance performance. Thank you for your patience!
      </AlertDescription>
    </Alert>
  );
};
