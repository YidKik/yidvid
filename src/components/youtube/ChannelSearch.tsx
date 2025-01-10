import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChannelSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ChannelSearch = ({ value, onChange }: ChannelSearchProps) => {
  return (
    <div className="flex items-center gap-2">
      <Search className="w-4 h-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search channels..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-64"
      />
    </div>
  );
};