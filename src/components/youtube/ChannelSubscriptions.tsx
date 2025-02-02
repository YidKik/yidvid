import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Youtube, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChannelSubscription {
  channel: {
    title: string;
    thumbnail_url: string | null;
    channel_id: string;
  };
}

export const ChannelSubscriptions = ({ userId }: { userId: string }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const { data: subscriptions, refetch } = useQuery({
    queryKey: ["channel-subscriptions", userId],
    queryFn: async () => {
      if (!userId) return [];

      console.log("Fetching subscriptions for user:", userId);
      const { data, error } = await supabase
        .from("channel_subscriptions")
        .select(`
          channel:youtube_channels!inner (
            title,
            thumbnail_url,
            channel_id
          )
        `)
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching subscriptions:", error);
        toast.error("Error fetching subscriptions");
        return [];
      }

      console.log("Fetched subscriptions:", data);
      return data as ChannelSubscription[];
    },
    enabled: !!userId && isAuthenticated,
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
      console.error("Error unsubscribing:", error);
      toast.error("Error unsubscribing from channel");
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Please sign in to manage your subscriptions.</p>
      </div>
    );
  }

  if (!subscriptions) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Channel Subscriptions</h3>
      {subscriptions && subscriptions.length > 0 ? (
        <div className="relative">
          {showLeftArrow && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90 shadow-md"
              onClick={() => scroll('left')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {showRightArrow && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90 shadow-md"
              onClick={() => scroll('right')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-4 px-2 pb-4 scrollbar-hide scroll-smooth"
          >
            {subscriptions.map((subscription) => (
              <div
                key={subscription.channel.channel_id}
                className="flex-shrink-0 w-[200px] p-4 rounded-lg bg-[#F8F8F8] hover:bg-[#F1F1F1] transition-colors relative group flex flex-col h-[280px]"
              >
                <div className="flex-grow flex flex-col items-center">
                  {subscription.channel.thumbnail_url ? (
                    <img
                      src={subscription.channel.thumbnail_url}
                      alt={subscription.channel.title}
                      className="w-20 h-20 rounded-full mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Youtube className="w-10 h-10 text-primary" />
                    </div>
                  )}
                  <h4 className="text-sm font-medium text-center text-[#333333] line-clamp-2 mb-3">
                    {subscription.channel.title}
                  </h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnsubscribe(subscription.channel.channel_id)}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 mt-auto"
                >
                  Unsubscribe
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">You are not subscribed to any channels.</p>
      )}
    </div>
  );
};