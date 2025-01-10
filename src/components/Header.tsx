import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4">
      <div className="flex items-center justify-between h-full max-w-[1800px] mx-auto">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-primary">JewTube</h1>
        </div>
        <div className="flex-1 max-w-2xl px-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search videos..."
              className="w-full pl-10 bg-muted"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
};