
import { ChannelRequestsSection } from "@/components/dashboard/ChannelRequestsSection";
import { BackButton } from "@/components/navigation/BackButton";

export default function RequestsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Channel Requests</h1>
      <ChannelRequestsSection />
    </div>
  );
}
