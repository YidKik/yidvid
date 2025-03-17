
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileSectionSkeleton = () => {
  return (
    <section className="mb-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
