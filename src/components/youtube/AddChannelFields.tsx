import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormValues {
  channelId: string;
  title: string;
  description?: string;
}

interface AddChannelFieldsProps {
  form: UseFormReturn<FormValues>;
  isLoading?: boolean;
}

export const AddChannelFields = ({ form, isLoading }: AddChannelFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="channelId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Channel ID</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter YouTube channel ID"
                {...field}
                required
              />
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
            <FormLabel>Channel Title</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="Enter channel title"
                  {...field}
                  required
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
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
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter channel description"
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};