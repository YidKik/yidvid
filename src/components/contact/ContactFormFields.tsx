
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
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-foreground">Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Your name" 
                {...field} 
                className="h-10 rounded-full border-2 border-border bg-white hover:border-[#FFCC00] focus:border-primary focus:ring-0 transition-colors px-4"
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
            <FormLabel className="text-sm font-semibold text-foreground">Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="you@example.com" 
                type="email" 
                {...field} 
                className="h-10 rounded-full border-2 border-border bg-white hover:border-[#FFCC00] focus:border-primary focus:ring-0 transition-colors px-4"
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
            <FormLabel className="text-sm font-semibold text-foreground">Message</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us what's on your mind..." 
                className="min-h-[100px] resize-none rounded-2xl border-2 border-border bg-white hover:border-[#FFCC00] focus:border-primary focus:ring-0 transition-colors px-4 py-3"
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
