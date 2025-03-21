
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  category: z.enum(['bug_report', 'feature_request', 'support', 'general'], {
    required_error: "Please select a category",
  }),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const categoryOptions = [
  {
    value: 'bug_report' as const,
    label: 'Report a Bug',
    description: 'Found something not working correctly?'
  },
  {
    value: 'feature_request' as const,
    label: 'Request a Feature',
    description: 'Have an idea for improving the platform?'
  },
  {
    value: 'support' as const,
    label: 'Get Support',
    description: 'Need help using the platform?'
  },
  {
    value: 'general' as const,
    label: 'General Inquiry',
    description: 'Any other questions or feedback'
  }
];

export const SupportSection = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'general',
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const user = await supabase.auth.getUser();
      const { error } = await supabase
        .from("contact_requests")
        .insert({
          category: data.category,
          name: data.name,
          email: data.email,
          message: data.message,
          user_id: user.data.user?.id,
        });

      if (error) throw error;

      toast.success("Contact request submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting contact request:", error);
      toast.error("Failed to submit contact request. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-primary/80">Help & Support</h2>
      <Card className="p-6 border-primary/20 shadow-sm">
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Need help or have suggestions? We're here to assist you.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-medium">Select a Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {categoryOptions.map((category) => (
                        <FormItem key={category.value}>
                          <FormControl>
                            <label
                              className={`flex items-start space-x-2 space-y-0 rounded-md border p-3 cursor-pointer transition-all duration-200
                                ${field.value === category.value 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-input hover:border-primary/50 hover:bg-accent/30'
                                }`}
                            >
                              <RadioGroupItem
                                value={category.value}
                                id={category.value}
                                className="mt-1"
                              />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {category.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {category.description}
                                </p>
                              </div>
                            </label>
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 bg-slate-50 p-4 rounded-md">
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
                        className="border-input hover:border-primary/50 focus:border-primary transition-colors"
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
                        className="border-input hover:border-primary/50 focus:border-primary transition-colors"
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
                        className="min-h-[120px] resize-none border-input hover:border-primary/50 focus:border-primary transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full transition-all duration-200 hover:shadow-md"
            >
              Send Message
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};
