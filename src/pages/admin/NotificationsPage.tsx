
import { GlobalNotificationsSection } from "@/components/dashboard/GlobalNotificationsSection";
import { BackButton } from "@/components/navigation/BackButton";

const NotificationsPage = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold">Global Notifications Management</h1>
      </div>
      <GlobalNotificationsSection />
    </div>
  );
};

export default NotificationsPage;
