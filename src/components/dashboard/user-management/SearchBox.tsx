
import { Input } from "@/components/ui/input";

interface SearchBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchBox = ({ searchQuery, setSearchQuery }: SearchBoxProps) => {
  return (
    <div className="mb-4">
      <Input
        placeholder="Search users by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />
    </div>
  );
};
