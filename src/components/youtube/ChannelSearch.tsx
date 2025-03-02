
import { Input } from "@/components/ui/input";

interface ChannelSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ChannelSearch = ({ value, onChange }: ChannelSearchProps) => {
  return (
    <Input
      type="search"
      placeholder="Search channels..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
};
