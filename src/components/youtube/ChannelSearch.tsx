
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface ChannelSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ChannelSearch = ({ value, onChange }: ChannelSearchProps) => {
  const debouncedValue = useDebounce(value, 300);
  
  useEffect(() => {
    // This effect triggers whenever the debounced search value changes
    // The parent component will handle the actual search logic
    if (debouncedValue !== value) {
      // Only update if the debounced value has caught up
      return;
    }
  }, [debouncedValue, value]);

  return (
    <Input
      type="search"
      placeholder="Search channels..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11"
    />
  );
};
