import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactRequestsSection } from "@/components/dashboard/ContactRequestsSection";
import { AdminEmailManagementSection } from "@/components/dashboard/AdminEmailManagementSection";
import { BroadcastEmailSection } from "@/components/admin/BroadcastEmailSection";

export const ContactRequestsPage = () => {
  return (
    <div className="space-y-6 max-w-7xl">
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Contact Requests</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <ContactRequestsSection />
        </TabsContent>

        <TabsContent value="email">
          <AdminEmailManagementSection />
        </TabsContent>

        <TabsContent value="broadcast">
          <BroadcastEmailSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
