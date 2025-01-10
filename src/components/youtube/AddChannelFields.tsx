import { UseFormReturn } from "react-hook-form";
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
}

export const AddChannelFields = ({ form }: AddChannelFieldsProps) => {
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
              <Input
                placeholder="Enter channel title"
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter channel description"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};