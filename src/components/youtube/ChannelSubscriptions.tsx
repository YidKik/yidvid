
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Youtube, ArrowLeft, ArrowRight, UserMinus, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Channel Subscriptions
          </CardTitle>
          <CardDescription>
            Please sign in to manage your subscriptions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!subscriptions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Channel Subscriptions
          </CardTitle>
          <CardDescription>Loading subscriptions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Channel Subscriptions
        </CardTitle>
        <CardDescription>
          Manage your channel subscriptions and stay updated with your favorite content creators
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptions && subscriptions.length > 0 ? (
          <div className="relative">
            {showLeftArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90 shadow-md rounded-full"
                onClick={() => scroll('left')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90 shadow-md rounded-full"
                onClick={() => scroll('right')}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <ScrollArea className="w-full">
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-3 pb-4 px-1 overflow-x-auto scrollbar-hide scroll-smooth"
              >
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.channel.channel_id}
                    className="flex-shrink-0 w-[180px] bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="p-3 flex flex-col h-[200px]">
                      <div className="relative mb-2 w-12 h-12 mx-auto rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                        {subscription.channel.thumbnail_url ? (
                          <img
                            src={subscription.channel.thumbnail_url}
                            alt={subscription.channel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Youtube className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 text-center line-clamp-2 mb-2 flex-grow">
                        {subscription.channel.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnsubscribe(subscription.channel.channel_id)}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 text-xs"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        Unsubscribe
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Youtube className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-muted-foreground text-center text-sm">
              You are not subscribed to any channels yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
