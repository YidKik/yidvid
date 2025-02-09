
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoReport {
  id: string;
  message: string;
  email: string;
  created_at: string;
  youtube_videos: {
    title: string;
    video_id: string;
  } | null;
}

export const ReportedVideosSection = () => {
  const queryClient = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ["video-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_reports")
        .select(`
          *,
          youtube_videos (
            title,
            video_id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast("Error", {
          description: "Failed to fetch video reports"
        });
        return [];
      }

      return data as VideoReport[];
    },
  });

  useEffect(() => {
    // Subscribe to changes in the video_reports table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_reports'
        },
        (payload) => {
          // Invalidate and refetch the reports query
          queryClient.invalidateQueries({ queryKey: ["video-reports"] });
          
          // Show a notification
          toast("New Report", {
            description: "A new video has been reported"
          });
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const openVideo = (videoId: string) => {
    window.open(`/video/${videoId}`, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Reported Videos</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video</TableHead>
            <TableHead>Reporter Email</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports?.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.youtube_videos?.title || "Unknown Video"}</TableCell>
              <TableCell>{report.email}</TableCell>
              <TableCell>{report.message}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openVideo(report.youtube_videos?.video_id || "")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
