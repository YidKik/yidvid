
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";
import { BackButton } from "@/components/navigation/BackButton";

export default function CommentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Comments Management</h1>
      <CommentsManagementSection />
    </div>
  );
}
