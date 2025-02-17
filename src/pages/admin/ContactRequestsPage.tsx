
import { ContactRequestsSection } from "@/components/dashboard/ContactRequestsSection";
import { BackButton } from "@/components/navigation/BackButton";

export default function ContactRequestsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Contact Requests</h1>
      <ContactRequestsSection />
    </div>
  );
}
