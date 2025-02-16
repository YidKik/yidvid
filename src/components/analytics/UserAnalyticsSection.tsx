
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, Eye, Layout } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const UserAnalyticsSection = () => {
  return (
    <section className="mb-12 relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <Alert variant="default" className="w-[90%] max-w-lg border-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Viewing statistics are currently unavailable. We're working on improving this feature.
          </AlertDescription>
        </Alert>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Your Viewing Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex flex-col items-center text-center">
          <Clock className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Total Time Spent</h3>
          <p className="text-2xl font-bold mt-2">--:--:--</p>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <Eye className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Videos Viewed</h3>
          <p className="text-2xl font-bold mt-2">--</p>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <Layout className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-medium">Channels Viewed</h3>
          <p className="text-2xl font-bold mt-2">--</p>
        </Card>
      </div>
    </section>
  );
};
