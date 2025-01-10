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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.channel.channel_id}>
                <TableCell className="flex items-center gap-2">
                  {subscription.channel.thumbnail_url ? (
                    <img
                      src={subscription.channel.thumbnail_url}
                      alt={subscription.channel.title}
                      className="w-8 h-8 rounded"
                    />
                  ) : (
                    <Youtube className="w-8 h-8 text-primary" />
                  )}
                  <span>{subscription.channel.title}</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUnsubscribe(subscription.channel.channel_id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground">You are not subscribed to any channels.</p>
      )}
    </div>
  );
};