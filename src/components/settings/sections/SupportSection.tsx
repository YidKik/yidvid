
import { Card } from "@/components/ui/card";
import { ContactDialog } from "@/components/contact/ContactDialog";

export const SupportSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-primary/80">Help & Support</h2>
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <p className="text-muted-foreground">
            Need help or have suggestions? We're here to assist you.
          </p>
          <ContactDialog />
        </div>
      </Card>
    </div>
  );
};
