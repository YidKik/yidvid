
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addChannel } from "@/utils/youtube/channel-operations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface AddChannelFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

type VideoCategory = "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";

export const AddChannelForm = ({ onClose, onSuccess }: AddChannelFormProps) => {
  const [channelId, setChannelId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>("other");
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'music' as const, label: 'Music' },
    { value: 'torah' as const, label: 'Torah' },
    { value: 'inspiration' as const, label: 'Inspiration' },
    { value: 'podcast' as const, label: 'Podcasts' },
    { value: 'education' as const, label: 'Education' },
    { value: 'entertainment' as const, label: 'Entertainment' },
    { value: 'other' as const, label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelId.trim()) {
      toast.error("Please enter a channel ID or URL");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add the channel first
      const result = await addChannel(channelId);
      
      if (result) {
        // Update the channel's default category
        const { error: categoryError } = await supabase
          .from("youtube_channels")
          .update({ default_category: selectedCategory })
          .eq("channel_id", result.channel?.channel_id || channelId);
          
        if (categoryError) {
          console.error("Error setting channel category:", categoryError);
          toast.error("Channel added but failed to set category");
        } else {
          toast.success(`Channel added successfully and categorized as ${categories.find(c => c.value === selectedCategory)?.label}`);
        }
        
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Error adding channel:", error);
      toast.error(error.message || "Failed to add channel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="channelId" className="text-sm font-medium">
          Channel ID or URL
        </label>
        <Input
          id="channelId"
          type="text"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          placeholder="Enter channel ID or URL"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as VideoCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Channel
        </Button>
      </div>
    </form>
  );
};
