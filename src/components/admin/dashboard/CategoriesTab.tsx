
import { ChannelCategoryManager } from "@/components/admin/ChannelCategoryManager";
import { ChannelCategorySelector } from "@/components/admin/ChannelCategorySelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const CategoriesTab = () => {
  return (
    <div className="space-y-8">
      <Tabs defaultValue="bulk-management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bulk-management">Bulk Channel Management</TabsTrigger>
          <TabsTrigger value="individual-management">Individual Channel Management</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-management">
          <ChannelCategorySelector />
        </TabsContent>

        <TabsContent value="individual-management">
          <ChannelCategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
