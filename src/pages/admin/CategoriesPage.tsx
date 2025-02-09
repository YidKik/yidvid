
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/navigation/BackButton";
import { VideoCategoryManagement } from "@/components/dashboard/VideoCategoryManagement";

export default function CategoriesPage() {
  const { data: videos, isLoading, error, refetch } = useQuery({
    queryKey: ["all-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      return data || [];
    },
  });

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          Error loading videos. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Category Management</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <VideoCategoryManagement videos={videos || []} onUpdate={() => refetch()} />
        )}
      </div>
    </div>
  );
}
