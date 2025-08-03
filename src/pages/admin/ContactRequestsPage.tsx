
import { ContactRequestsSection } from "@/components/dashboard/ContactRequestsSection";
import { AdminEmailManagementSection } from "@/components/dashboard/AdminEmailManagementSection";
import { BackButton } from "@/components/navigation/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContactRequestsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Contact Requests Management</h1>
      
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Contact Requests</TabsTrigger>
          <TabsTrigger value="emails">Email Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <ContactRequestsSection />
        </TabsContent>
        
        <TabsContent value="emails">
          <AdminEmailManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
