
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { BackButton } from "@/components/navigation/BackButton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export default function ChannelsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <BackButton />
        
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-gray-600 hover:text-primary">
                <Home className="h-4 w-4 mr-1" />
                <span>Dashboard</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin" className="text-gray-600 hover:text-primary">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-medium">
                Channels
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <h1 className="text-3xl font-bold text-primary">Manage YouTube Channels</h1>
      <p className="text-gray-700">Add, edit or remove YouTube channels for your platform.</p>
      <YouTubeChannelsSection />
    </div>
  );
}
