
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface WelcomeNameFieldProps {
  welcomeName: string;
  setWelcomeName: (name: string) => void;
  handleSave: () => void;
}

export const WelcomeNameField = ({ welcomeName, setWelcomeName, handleSave }: WelcomeNameFieldProps) => {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="welcomeName">Welcome Page Name</Label>
        <div className="flex gap-2">
          <Input
            id="welcomeName"
            value={welcomeName}
            onChange={(e) => setWelcomeName(e.target.value)}
            placeholder="Enter your welcome page name"
          />
          <Button onClick={handleSave} variant="secondary">
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          This name will be displayed on the welcome page when you visit the site.
        </p>
      </div>
    </div>
  );
};
