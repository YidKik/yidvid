
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChannelsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Channel Management</h1>
      </div>
      <YouTubeChannelsSection />
    </div>
  );
}
