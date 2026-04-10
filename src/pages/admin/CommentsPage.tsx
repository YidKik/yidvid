
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";

export default function CommentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Comments Management</h1>
      <CommentsManagementSection />
    </div>
  );
}
