
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";
import { User, AtSign, PenLine } from "lucide-react";

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
            <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Name
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Your name" 
                {...field} 
                className="h-10 rounded-xl border-2 border-border bg-muted/30 hover:border-primary/40 focus:border-primary focus:ring-0 transition-colors placeholder:text-muted-foreground/60"
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
            <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-muted-foreground" />
              Email
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="you@example.com" 
                type="email" 
                {...field} 
                className="h-10 rounded-xl border-2 border-border bg-muted/30 hover:border-primary/40 focus:border-primary focus:ring-0 transition-colors placeholder:text-muted-foreground/60"
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
            <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <PenLine className="w-3.5 h-3.5 text-muted-foreground" />
              Message
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us what's on your mind..." 
                className="min-h-[100px] resize-none rounded-xl border-2 border-border bg-muted/30 hover:border-primary/40 focus:border-primary focus:ring-0 transition-colors placeholder:text-muted-foreground/60"
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
