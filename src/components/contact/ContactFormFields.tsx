
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContactFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const ContactFormFields = ({ form }: ContactFormFieldsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`space-y-4 border border-white/20 p-3 md:p-4 rounded-md ${isMobile ? 'mx-0.5' : ''}`}>
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
                className="border-input hover:border-primary/50 focus:border-primary transition-colors bg-transparent text-white"
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
                className="border-input hover:border-primary/50 focus:border-primary transition-colors bg-transparent text-white"
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
                className="min-h-[120px] resize-none border-input hover:border-primary/50 focus:border-primary transition-colors bg-transparent text-white"
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
