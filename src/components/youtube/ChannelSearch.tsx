
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface ChannelSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ChannelSearch = ({ value, onChange }: ChannelSearchProps) => {
  return (
    <div className="relative flex-1">
      <Input
        type="text"
        placeholder="Search channels..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pr-8 bg-white/80 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
