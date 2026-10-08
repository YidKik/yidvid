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
import { useSessionManager } from "@/hooks/useSessionManager";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useUnifiedAuth();
  const { isMobile } = useIsMobile();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { setIsAuthOpen } = useSessionManager();

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
      <div className="min-h-screen bg-muted dark:bg-background pt-16 pl-0 lg:pl-[200px] pb-24 lg:pb-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted dark:bg-background pt-16 pl-0 lg:pl-[200px] pb-24 lg:pb-8 flex flex-col items-center justify-center gap-4 px-4">
        <Users className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground dark:text-muted-foreground text-center">Please sign in to view your subscriptions.</p>
        <Button onClick={() => setIsAuthOpen(true)} className="bg-primary hover:bg-primary-hover text-white rounded-full px-6">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted dark:bg-background pt-14 pl-0 lg:pl-[200px] pb-24 lg:pb-8 transition-all duration-300">
      <div className={cn("max-w-5xl mx-auto", isMobile ? "px-4 pt-4" : "px-8 pt-6")}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary rounded-xl">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={cn("font-bold text-foreground dark:text-foreground", isMobile ? "text-xl" : "text-2xl")}>
              Subscriptions
            </h1>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              {subscriptions.length} channel{subscriptions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-card rounded-2xl border border-border dark:border-border">
            <Users className="w-12 h-12 text-muted-foreground dark:text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground dark:text-foreground mb-1">No Subscriptions Yet</h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground text-center">
              Subscribe to channels to get notified of new videos.
            </p>
          </div>
        ) : (
          <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            {subscriptions.map((sub) => (
              <div
                key={sub.channel.channel_id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-card rounded-xl border border-border dark:border-border hover:shadow-sm transition-shadow"
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
                      className="w-12 h-12 rounded-full object-cover border-2 border-border dark:border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-brand" />
                    </div>
                  )}
                </button>

                {/* Info */}
                <button
                  onClick={() => navigate(`/channel/${sub.channel.channel_id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <h3 className="font-semibold text-sm text-foreground dark:text-foreground truncate">
                    {sub.channel.title}
                  </h3>
                  {sub.channel.description && (
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground line-clamp-1 mt-0.5">
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
                  className="shrink-0 text-xs rounded-lg border-border dark:border-border text-muted-foreground dark:text-muted-foreground hover:text-brand hover:border-brand/30"
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
