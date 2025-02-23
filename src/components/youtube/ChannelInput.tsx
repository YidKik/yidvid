
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChannelInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ChannelInput = ({ value, onChange, disabled }: ChannelInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="channelId">YouTube Channel ID or URL</Label>
      <Input
        id="channelId"
        placeholder="Enter channel URL, @handle, or ID"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};
