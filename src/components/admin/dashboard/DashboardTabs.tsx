
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./OverviewTab";
import { ContentTab } from "./ContentTab";
import { UsersTab } from "./UsersTab";
import { CategoriesTab } from "./CategoriesTab";

interface DashboardTabsProps {
  currentUserId: string;
}

export const DashboardTabs = ({ currentUserId }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-8">
      <TabsList className="bg-muted p-1 rounded-full w-full sm:w-auto flex justify-center gap-2">
        <TabsTrigger 
          value="overview" 
          className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="content" 
          className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
        >
          Content
        </TabsTrigger>
        <TabsTrigger 
          value="users" 
          className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
        >
          Users
        </TabsTrigger>
        <TabsTrigger 
          value="categories" 
          className="rounded-full px-8 py-2.5 data-[state=active]:shadow-lg transition-all duration-200"
        >
          Categories
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>

      <TabsContent value="content">
        <ContentTab />
      </TabsContent>

      <TabsContent value="users">
        <UsersTab currentUserId={currentUserId} />
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesTab />
      </TabsContent>
    </Tabs>
  );
};
