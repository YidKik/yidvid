import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelsContainer } from "@/components/dashboard/youtube/ChannelsContainer";
import { RestoreDeletedItems } from "@/components/admin/RestoreDeletedItems";

export const VideosChannelsPage = () => {
  return (
    <div className="space-y-6 max-w-7xl">
      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">YouTube Channels</TabsTrigger>
          <TabsTrigger value="restore">Restore Deleted</TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <ChannelsContainer />
        </TabsContent>

        <TabsContent value="restore">
          <RestoreDeletedItems />
        </TabsContent>
      </Tabs>
    </div>
  );
};
