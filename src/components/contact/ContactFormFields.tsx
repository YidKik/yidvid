
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface ContactFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const ContactFormFields = ({ form }: ContactFormFieldsProps) => {
  const inputStyle = "h-10 rounded-control border border-border bg-transparent hover:border-brand focus:border-[#222] focus:ring-0 focus:bg-transparent transition-colors px-4 placeholder:text-muted-foreground";

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Your name" 
                {...field} 
                className={inputStyle}
                style={{ color: 'hsl(var(--foreground))' }}
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
            <FormLabel className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="you@example.com" 
                type="email" 
                {...field} 
                className={inputStyle}
                style={{ color: 'hsl(var(--foreground))' }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="user_id_display"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>User ID <span className="text-xs font-normal text-muted-foreground">(optional)</span></FormLabel>
            <FormControl>
              <Input 
                placeholder="Auto-filled when signed in" 
                {...field} 
                className={inputStyle}
                style={{ color: 'hsl(var(--foreground))' }}
                readOnly
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
            <FormLabel className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Message</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us what's on your mind..." 
                className="min-h-[100px] resize-none rounded-control border border-border bg-transparent hover:border-brand focus:border-[#222] focus:ring-0 focus:bg-transparent transition-colors px-4 py-3 placeholder:text-muted-foreground"
                style={{ color: 'hsl(var(--foreground))' }}
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
