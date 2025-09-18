
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./OverviewTab";
import { ContentTab } from "./ContentTab";
import { ContentAnalysisTab } from "./ContentAnalysisTab";
import { UsersTab } from "./UsersTab";
import { CategoriesTab } from "./CategoriesTab";
import { ChannelCategoryTab } from "./ChannelCategoryTab";
import { useSearchParams } from "react-router-dom";

interface DashboardTabsProps {
  currentUserId: string;
}

export const DashboardTabs = ({ currentUserId }: DashboardTabsProps) => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  return (
    <div className="w-full">
      <Tabs defaultValue={initialTab} className="space-y-6">
        <div className="sticky top-0 bg-white z-10 pb-4 border-b">
          <TabsList className="bg-muted p-1 rounded-full w-full flex justify-start overflow-x-auto gap-1 min-w-max">
            <TabsTrigger 
              value="overview" 
              className="rounded-full px-6 py-2.5 data-[state=active]:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="rounded-full px-6 py-2.5 data-[state=active]:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Content
            </TabsTrigger>
            <TabsTrigger 
              value="content-analysis" 
              className="rounded-full px-6 py-2.5 data-[state=active]:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              AI Filtering
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-full px-6 py-2.5 data-[state=active]:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="channel-categories" 
              className="rounded-full px-6 py-2.5 data-[state=active]:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Channel Categories
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="rounded-full px-6 py-2.5 data-[state=active]:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Video Categories
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <ContentTab />
          </TabsContent>

          <TabsContent value="content-analysis" className="mt-0">
            <ContentAnalysisTab />
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <UsersTab currentUserId={currentUserId} />
          </TabsContent>

          <TabsContent value="channel-categories" className="mt-0">
            <ChannelCategoryTab />
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <CategoriesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
