import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Youtube, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChannelSubscription {
  channel: {
    title: string;
    thumbnail_url: string | null;
    channel_id: string;
  };
}

export const ChannelSubscriptions = ({ userId }: { userId: string }) => {
  const { data: subscriptions, refetch } = useQuery({
    queryKey: ["channel-subscriptions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_subscriptions")
        .select(`
          channel:youtube_channels (
            title,
            thumbnail_url,
            channel_id
          )
        `)
        .eq("user_id", userId);

      if (error) {
        toast.error("Error fetching subscriptions");
        return [];
      }

      return data as ChannelSubscription[];
    },
  });

  const handleUnsubscribe = async (channelId: string) => {
    try {
      const { error } = await supabase
        .from("channel_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("channel_id", channelId);

      if (error) throw error;

      toast.success("Unsubscribed from channel");
      refetch();
    } catch (error: any) {
      toast.error("Error unsubscribing from channel");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Channel Subscriptions</h3>
      {subscriptions && subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.channel.channel_id}
              className="flex flex-col items-center p-4 rounded-lg bg-[#F8F8F8] hover:bg-[#F1F1F1] transition-colors relative group"
            >
              {subscription.channel.thumbnail_url ? (
                <img
                  src={subscription.channel.thumbnail_url}
                  alt={subscription.channel.title}
                  className="w-20 h-20 rounded-full mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Youtube className="w-10 h-10 text-primary" />
                </div>
              )}
              <h4 className="text-sm font-medium text-center text-[#333333] line-clamp-2 mt-2">
                {subscription.channel.title}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUnsubscribe(subscription.channel.channel_id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You are not subscribed to any channels.</p>
      )}
    </div>
  );
};