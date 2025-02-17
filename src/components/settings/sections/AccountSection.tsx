
import { Card } from "@/components/ui/card";
import { ProfileSection } from "@/components/settings/ProfileSection";

export const AccountSection = () => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-primary/80 mb-4">Account</h2>
      <Card className="p-6">
        <div className="flex flex-col space-y-6">
          <ProfileSection />
        </div>
      </Card>
    </section>
  );
};
