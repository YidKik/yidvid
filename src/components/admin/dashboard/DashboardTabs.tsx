
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
        <div className="sticky top-0 bg-card text-card-foreground z-10 pb-4 rounded-card shadow-sm border border-border p-4">
          <TabsList className="bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 rounded-card w-full flex justify-start overflow-x-auto gap-2 min-w-max border border-gray-200">
            <TabsTrigger 
              value="overview" 
              className="rounded-control px-6 py-3 data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-200 whitespace-nowrap font-medium"
            >
              📊 Overview
            </TabsTrigger>
            <TabsTrigger 
              value="content-analysis" 
              className="rounded-control px-6 py-3 data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-200 whitespace-nowrap font-medium"
            >
              🛡️ AI Filtering
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="rounded-control px-6 py-3 data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-200 whitespace-nowrap font-medium"
            >
              📁 Content
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-control px-6 py-3 data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-200 whitespace-nowrap font-medium"
            >
              👥 Users
            </TabsTrigger>
            <TabsTrigger 
              value="channel-categories" 
              className="rounded-control px-6 py-3 data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-200 whitespace-nowrap font-medium"
            >
              🏷️ Channel Categories
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="rounded-control px-6 py-3 data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-200 whitespace-nowrap font-medium"
            >
              🎬 Video Categories
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6 bg-card text-card-foreground rounded-card shadow-sm border border-border p-6">
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
