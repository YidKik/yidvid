
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FetchingIssueAlertProps {
  onRefresh?: () => void;
  forceShow?: boolean;
}

export const FetchingIssueAlert = ({ onRefresh, forceShow = false }: FetchingIssueAlertProps) => {
  const isMobile = useIsMobile();
  
  // Only show for admins by default
  const { data: profile } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return null;
      
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.session.user.id)
        .single();
      
      return data;
    },
    enabled: !forceShow, // Skip if we're forcing display
  });
  
  // Only show to admins unless forced
  if (!forceShow && (!profile || !profile.is_admin)) {
    return null;
  }
  
  return (
    <Alert 
      variant="destructive" 
      className="mb-3 mt-1 bg-white border border-black text-black text-xs max-w-full shadow-sm"
    >
      <AlertCircle className="h-3.5 w-3.5 text-black" />
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-black text-xs font-semibold">
            {isMobile ? "Note" : "Attention"}
          </AlertTitle>
          <AlertDescription className={`text-black ${isMobile ? "alert-compact-text text-xs" : "text-xs"}`}>
            {isMobile ? "Videos may take a moment to load." : "Some videos may take a moment to appear. We're working on it!"}
          </AlertDescription>
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            className="mt-1 md:mt-0 md:ml-2 bg-white hover:bg-gray-100 text-black border-black text-xs px-2 py-0.5 h-auto"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        )}
      </div>
    </Alert>
  );
};
