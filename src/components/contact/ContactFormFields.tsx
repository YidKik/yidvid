
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface ContactFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const ContactFormFields = ({ form }: ContactFormFieldsProps) => {
  return (
    <div className="space-y-4 border-2 border-gray-400/30 p-4 rounded-md">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your name" 
                {...field} 
                className="border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your email" 
                type="email" 
                {...field} 
                className="border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Message</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What would you like to tell us?" 
                className="min-h-[120px] resize-none border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
