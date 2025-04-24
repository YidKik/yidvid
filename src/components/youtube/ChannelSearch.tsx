
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface ChannelSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ChannelSearch = ({ value, onChange }: ChannelSearchProps) => {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, 300);
  
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <Input
      type="search"
      placeholder="Search channels..."
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className="w-full h-11"
    />
  );
};
