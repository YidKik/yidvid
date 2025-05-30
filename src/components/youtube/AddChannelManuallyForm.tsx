import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { addChannelManually } from "@/utils/youtube/channel-operations";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddChannelManuallyFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  channel_id: z.string().min(2, {
    message: "Channel ID must be at least 2 characters.",
  }),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  thumbnail_url: z.string().optional(),
  default_category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const AddChannelManuallyForm = ({ onClose, onSuccess }: AddChannelManuallyFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    defaultValues: {
      channel_id: "",
      title: "",
      description: "",
      thumbnail_url: "",
      default_category: "other"
    }
  });

  const categories = [
    { value: 'music', label: 'Music' },
    { value: 'torah', label: 'Torah' },
    { value: 'inspiration', label: 'Inspiration' },
    { value: 'podcast', label: 'Podcasts' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' },
  ];

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      console.log("Adding channel manually with values:", values);

      const result = await addChannelManually(values);
      console.log("Channel added manually successfully:", result);
      
      toast.success(`Channel "${values.title}" added successfully and categorized as ${categories.find(c => c.value === values.default_category)?.label}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error in manual channel addition:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add channel manually");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="channel_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel ID</FormLabel>
              <FormControl>
                <Input placeholder="Channel ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnail_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <FormControl>
                <Input placeholder="Thumbnail URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
    </Form>
  );
};
