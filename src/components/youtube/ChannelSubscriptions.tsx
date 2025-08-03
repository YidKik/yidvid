
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Youtube, ArrowLeft, ArrowRight, UserMinus, Bell, Loader2 } from "lucide-react";
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
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface ChannelSubscription {
  channel: {
    title: string;
    thumbnail_url: string | null;
    channel_id: string;
  };
}

export const ChannelSubscriptions = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const { isAuthenticated, user, isLoading: authLoading } = useUnifiedAuth();
  const [processingUnsubscribe, setProcessingUnsubscribe] = useState<string | null>(null);

  console.log("ChannelSubscriptions state:", {
    userId: user?.id,
    isAuthenticated,
    authLoading
  });

  useEffect(() => {
    const checkScrollability = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setShowRightArrow(container.scrollWidth > container.clientWidth);
        setShowLeftArrow(container.scrollLeft > 0);
      }
    };

    checkScrollability();
    window.addEventListener('resize', checkScrollability);

    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const { data: subscriptions, refetch, isLoading, error } = useQuery({
    queryKey: ["channel-subscriptions", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No userId provided for subscriptions");
        return [];
      }

      console.log("Fetching subscriptions for user:", user.id);
      const { data, error } = await supabase
        .from("channel_subscriptions")
        .select(`
          channel:youtube_channels!inner (
            title,
            thumbnail_url,
            channel_id
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching subscriptions:", error);
        throw error;
      }

      console.log("Fetched subscriptions:", data?.length || 0, "subscriptions");
      return data as ChannelSubscription[];
    },
    enabled: isAuthenticated && !!user?.id && !authLoading,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  const handleUnsubscribe = async (channelId: string, channelTitle: string) => {
    if (!user?.id) {
      // Removed toast notification for subscriptions management
      return;
    }
    
    try {
      setProcessingUnsubscribe(channelId);
      
      const { error } = await supabase.functions.invoke('channel-subscribe', {
        body: {
          channelId: channelId,
          userId: user.id,
          action: 'unsubscribe'
        }
      });

      if (error) throw error;

      // Removed toast notification for successful unsubscribe
      await refetch();
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      // Removed toast notification for unsubscribe errors
    } finally {
      setProcessingUnsubscribe(null);
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
      container.scrollLeft < (container.scrollWidth - container.clientWidth - 10)
    );
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Channel Subscriptions
          </CardTitle>
          <CardDescription>Loading your authentication state...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Channel Subscriptions
          </CardTitle>
          <CardDescription>
            Please sign in to manage your channel subscriptions and get notified of new videos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    console.error("Subscription fetch error:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Channel Subscriptions
          </CardTitle>
          <CardDescription>
            Error loading subscriptions. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="mt-2"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Channel Subscriptions
          </CardTitle>
          <CardDescription>Loading your subscriptions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg rounded-3xl bg-gradient-to-br from-white to-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-2xl">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-primary">
                Channel Subscriptions
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Manage your subscriptions and get notified of new content
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {subscriptions && subscriptions.length > 0 ? (
          <div className="relative">
            {showLeftArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary/10 hover:bg-primary/20 text-primary shadow-lg rounded-full border border-primary/30"
                onClick={() => scroll('left')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary/10 hover:bg-primary/20 text-primary shadow-lg rounded-full border border-primary/30"
                onClick={() => scroll('right')}
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
            )}
            <ScrollArea className="w-full">
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-4 pb-4 px-2 overflow-x-auto scrollbar-hide scroll-smooth"
              >
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.channel.channel_id}
                    className="flex-shrink-0 w-[200px] bg-white rounded-2xl shadow-md border-2 border-primary/10 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className="p-4 flex flex-col h-[220px]">
                      <div className="relative mb-3 w-16 h-16 mx-auto rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center shadow-md">
                        {subscription.channel.thumbnail_url ? (
                          <img
                            src={subscription.channel.thumbnail_url}
                            alt={subscription.channel.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Youtube className="w-8 h-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 text-center line-clamp-2 mb-3 flex-grow">
                        {subscription.channel.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnsubscribe(subscription.channel.channel_id, subscription.channel.title)}
                        disabled={processingUnsubscribe === subscription.channel.channel_id}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 text-xs border border-red-200 hover:border-red-300 rounded-xl"
                      >
                        {processingUnsubscribe === subscription.channel.channel_id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Unsubscribing...
                          </>
                        ) : (
                          <>
                            <UserMinus className="w-4 h-4" />
                            Unsubscribe
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-secondary/20 to-primary/10 rounded-2xl border border-primary/20">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Bell className="w-12 h-12 text-primary" />
            </div>
            <h3 className="font-semibold text-primary mb-2">No Subscriptions Yet</h3>
            <p className="text-muted-foreground text-center text-sm mb-1">
              You haven't subscribed to any channels yet.
            </p>
            <p className="text-muted-foreground text-center text-xs">
              Start exploring and subscribe to get notifications!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
