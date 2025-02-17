
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
    <div className="space-y-2 md:space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs md:text-base text-white">Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your name" 
                {...field} 
                className="bg-[#444444] border-gray-600 text-white placeholder:text-gray-400 h-8 md:h-10 text-xs md:text-base"
              />
            </FormControl>
            <FormMessage className="text-[10px] md:text-sm text-red-400" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs md:text-base text-white">Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your email" 
                type="email" 
                {...field} 
                className="bg-[#444444] border-gray-600 text-white placeholder:text-gray-400 h-8 md:h-10 text-xs md:text-base"
              />
            </FormControl>
            <FormMessage className="text-[10px] md:text-sm text-red-400" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs md:text-base text-white">Message</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What would you like to tell us?" 
                className="min-h-[60px] md:min-h-[100px] bg-[#444444] border-gray-600 text-white placeholder:text-gray-400 text-xs md:text-base resize-none"
                {...field} 
              />
            </FormControl>
            <FormMessage className="text-[10px] md:text-sm text-red-400" />
          </FormItem>
        )}
      />
    </div>
  );
};
