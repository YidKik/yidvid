
import { ContactRequestsSection } from "@/components/dashboard/ContactRequestsSection";
import { AdminEmailManagementSection } from "@/components/dashboard/AdminEmailManagementSection";
import { BroadcastEmailSection } from "@/components/admin/BroadcastEmailSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContactRequestsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Contact Requests Management</h1>
      
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Contact Requests</TabsTrigger>
          <TabsTrigger value="emails">Email Settings</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <ContactRequestsSection />
        </TabsContent>
        
        <TabsContent value="emails">
          <AdminEmailManagementSection />
        </TabsContent>

        <TabsContent value="broadcast">
          <BroadcastEmailSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
