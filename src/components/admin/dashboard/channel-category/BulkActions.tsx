
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save, Loader2, X } from "lucide-react";
import { VideoCategory, categories } from "./types";

interface BulkActionsProps {
  bulkCategory: VideoCategory | "";
  setBulkCategory: (category: VideoCategory | "") => void;
  selectedChannels: string[];
  setSelectedChannels: (channels: string[]) => void;
  onBulkUpdate: () => void;
  isUpdating: boolean;
}

export const BulkActions = ({
  bulkCategory,
  setBulkCategory,
  selectedChannels,
  setSelectedChannels,
  onBulkUpdate,
  isUpdating
}: BulkActionsProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-blue-50 rounded-lg border">
      <Select value={bulkCategory} onValueChange={(value) => setBulkCategory(value as VideoCategory)}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Select category for bulk update" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.icon} {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            disabled={!bulkCategory || selectedChannels.length === 0 || isUpdating}
            className="whitespace-nowrap"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Update Selected ({selectedChannels.length})
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update {selectedChannels.length} channels to the "{bulkCategory}" category? 
              This will also update all videos from these channels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onBulkUpdate}>
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedChannels.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            onClick={() => setSelectedChannels([])}
            size="sm"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};
