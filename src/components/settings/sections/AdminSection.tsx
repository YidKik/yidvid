
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AdminSectionProps {
  isAdmin: boolean;
}

export const AdminSection = ({ isAdmin }: AdminSectionProps) => {
  const navigate = useNavigate();

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-primary/80">Admin Controls</h2>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">
              Access the admin dashboard to manage channels and videos
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard")}>
            Open Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
