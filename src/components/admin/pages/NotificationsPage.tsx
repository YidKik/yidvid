import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobalNotificationsSection } from "@/components/dashboard/GlobalNotificationsSection";
import { ChannelRequestsSection } from "@/components/dashboard/ChannelRequestsSection";

export const NotificationsPage = () => {
  return (
    <div className="space-y-6 max-w-7xl">
      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global">Global Notifications</TabsTrigger>
          <TabsTrigger value="requests">Channel Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <GlobalNotificationsSection />
        </TabsContent>

        <TabsContent value="requests">
          <ChannelRequestsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
