import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Users, Loader2, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useUnifiedAuth();
  const { isMobile } = useIsMobile();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: subscriptions = [], isLoading, refetch } = useQuery({
    queryKey: ["channel-subscriptions-page", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("channel_subscriptions")
        .select(`
          channel:youtube_channels!inner (
            title,
            thumbnail_url,
            channel_id,
            description
          )
        `)
        .eq("user_id", user.id);
      if (error) throw error;
      return data as { channel: { title: string; thumbnail_url: string | null; channel_id: string; description: string | null } }[];
    },
    enabled: isAuthenticated && !!user?.id && !authLoading,
  });

  const handleUnsubscribe = async (channelId: string) => {
    if (!user?.id) return;
    try {
      setProcessingId(channelId);
      const { error } = await supabase.functions.invoke('channel-subscribe', {
        body: { channelId, userId: user.id, action: 'unsubscribe' }
      });
      if (error) throw error;
      toast.success("Unsubscribed successfully");
      await refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to unsubscribe");
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0f0f0f] pt-16 pl-0 lg:pl-[200px] pb-24 lg:pb-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF0000]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0f0f0f] pt-16 pl-0 lg:pl-[200px] pb-24 lg:pb-8 flex flex-col items-center justify-center gap-4 px-4">
        <Users className="w-12 h-12 text-[#ccc]" />
        <p className="text-[#666] dark:text-[#aaa] text-center">Please sign in to view your subscriptions.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0f0f0f] pt-14 pl-0 lg:pl-[200px] pb-24 lg:pb-8 transition-all duration-300">
      <div className={cn("max-w-5xl mx-auto", isMobile ? "px-4 pt-4" : "px-8 pt-6")}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#FF0000] rounded-xl">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={cn("font-bold text-[#1A1A1A] dark:text-[#e8e8e8]", isMobile ? "text-xl" : "text-2xl")}>
              Subscriptions
            </h1>
            <p className="text-xs text-[#888] dark:text-[#777]">
              {subscriptions.length} channel{subscriptions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E5E5] dark:border-[#333]">
            <Users className="w-12 h-12 text-[#ccc] dark:text-[#555] mb-3" />
            <h3 className="font-semibold text-[#1A1A1A] dark:text-[#e8e8e8] mb-1">No Subscriptions Yet</h3>
            <p className="text-sm text-[#888] dark:text-[#777] text-center">
              Subscribe to channels to get notified of new videos.
            </p>
          </div>
        ) : (
          <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            {subscriptions.map((sub) => (
              <div
                key={sub.channel.channel_id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#E5E5E5] dark:border-[#333] hover:shadow-sm transition-shadow"
              >
                {/* Thumbnail */}
                <button
                  onClick={() => navigate(`/channel/${sub.channel.channel_id}`)}
                  className="shrink-0"
                >
                  {sub.channel.thumbnail_url ? (
                    <img
                      src={sub.channel.thumbnail_url}
                      alt={sub.channel.title}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#E5E5E5] dark:border-[#444]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#FF0000]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#FF0000]" />
                    </div>
                  )}
                </button>

                {/* Info */}
                <button
                  onClick={() => navigate(`/channel/${sub.channel.channel_id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-[#e8e8e8] truncate">
                    {sub.channel.title}
                  </h3>
                  {sub.channel.description && (
                    <p className="text-xs text-[#888] dark:text-[#777] line-clamp-1 mt-0.5">
                      {sub.channel.description}
                    </p>
                  )}
                </button>

                {/* Unsubscribe */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnsubscribe(sub.channel.channel_id)}
                  disabled={processingId === sub.channel.channel_id}
                  className="shrink-0 text-xs rounded-lg border-[#E5E5E5] dark:border-[#444] text-[#666] dark:text-[#aaa] hover:text-[#FF0000] hover:border-[#FF0000]/30"
                >
                  {processingId === sub.channel.channel_id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Unsubscribe"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
