
import { BackButton } from "@/components/navigation/BackButton";
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
import { ExternalLink, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

export default function ReportedVideosPage() {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
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
        toast.error("Failed to fetch video reports");
        return [];
      }

      return data as VideoReport[];
    },
  });

  useEffect(() => {
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
          queryClient.invalidateQueries({ queryKey: ["video-reports"] });
          toast("New Report", {
            description: "A new video has been reported"
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const openVideo = (videoId: string) => {
    window.open(`/video/${videoId}`, '_blank');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Flag className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold">Reported Videos</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading reports...</div>
        ) : reports?.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No videos have been reported yet.</p>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
}
