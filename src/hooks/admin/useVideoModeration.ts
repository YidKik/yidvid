import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface ModerationVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  channel_name: string | null;
  content_analysis_status?: string | null;
  deleted_at?: string | null;
}

const selectFields = "id,title,thumbnail,channel_name,content_analysis_status,deleted_at";

export const useVideoModeration = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const approvedQuery = useQuery({
    queryKey: ["moderation","approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select(selectFields)
        .eq("content_analysis_status", "approved")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ModerationVideo[];
    }
  });

  const rejectedQuery = useQuery({
    queryKey: ["moderation","rejected"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select(selectFields)
        .eq("content_analysis_status", "rejected")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ModerationVideo[];
    }
  });

  const reviewQueueQuery = useQuery({
    queryKey: ["moderation","review"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select(selectFields)
        .or("content_analysis_status.eq.pending,content_analysis_status.eq.flagged,manual_review_required.eq.true")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ModerationVideo[];
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (video: ModerationVideo) => {
      // 1) Mark as rejected
      const { error: updateErr } = await supabase
        .from("youtube_videos")
        .update({ 
          content_analysis_status: "rejected",
          manual_review_required: false,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", video.id);
      if (updateErr) throw updateErr;

      // 2) Soft delete via RPC
      const { data, error: rpcErr } = await supabase.rpc("admin_delete_video", {
        video_id_param: video.id,
        admin_user_id: user?.id
      });
      if (rpcErr) throw rpcErr;
      return data;
    },
    onSuccess: () => {
      toast.success("Video rejected and removed");
      qc.invalidateQueries({ queryKey: ["moderation"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to reject video")
  });

  const approveMutation = useMutation({
    mutationFn: async (video: ModerationVideo) => {
      // If it was deleted, restore first
      if (video.deleted_at) {
        const { error: restoreErr } = await supabase.rpc("admin_restore_video", {
          video_id_param: video.id,
          admin_user_id: user?.id
        });
        if (restoreErr) throw restoreErr;
      }

      const { error: updateErr } = await supabase
        .from("youtube_videos")
        .update({ 
          content_analysis_status: "approved",
          manual_review_required: false,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
          deleted_at: null
        })
        .eq("id", video.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      toast.success("Video approved and published");
      qc.invalidateQueries({ queryKey: ["moderation"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to approve video")
  });

  return {
    approved: approvedQuery.data || [],
    rejected: rejectedQuery.data || [],
    reviewQueue: reviewQueueQuery.data || [],
    isLoading: approvedQuery.isLoading || rejectedQuery.isLoading || reviewQueueQuery.isLoading,
    error: approvedQuery.error || rejectedQuery.error || reviewQueueQuery.error,
    approve: (v: ModerationVideo) => approveMutation.mutate(v),
    reject: (v: ModerationVideo) => rejectMutation.mutate(v),
  };
}
