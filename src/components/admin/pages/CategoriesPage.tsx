import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelCategoryTab } from "@/components/admin/dashboard/ChannelCategoryTab";
import { VideoCategoryManagement } from "@/components/dashboard/VideoCategoryManagement";

export const CategoriesPage = () => {
  return (
    <div className="space-y-6 max-w-7xl">
      <Tabs defaultValue="channel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channel">Channel Categories</TabsTrigger>
          <TabsTrigger value="video">Video Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="channel">
          <ChannelCategoryTab />
        </TabsContent>

        <TabsContent value="video">
          <VideoCategoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
