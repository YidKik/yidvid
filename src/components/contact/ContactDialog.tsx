
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    value: 'bug_report',
    label: 'Report a Bug',
    description: 'Found something not working correctly?'
  },
  {
    value: 'feature_request',
    label: 'Request a Feature',
    description: 'Have an idea for improving the platform?'
  },
  {
    value: 'support',
    label: 'Get Support',
    description: 'Need help using the platform?'
  },
  {
    value: 'general',
    label: 'General Inquiry',
    description: 'Any other questions or feedback'
  }
];

export const ContactDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting contact request:", error);
      toast.error("Failed to submit contact request. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1.5 bg-white hover:bg-gray-50 h-7 md:h-9 px-2 md:px-3.5 rounded-full shadow-sm border border-gray-200"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Contact</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#333333] text-white border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white">Contact Us</DialogTitle>
          <DialogDescription className="text-gray-300">
            How can we help you today? Choose a category below and send us your message.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-white">Select a Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {categoryOptions.map((category) => (
                        <FormItem key={category.value}>
                          <FormControl>
                            <label
                              className={`flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-[#444444] transition-colors ${
                                field.value === category.value ? 'border-primary' : 'border-gray-600'
                              }`}
                            >
                              <RadioGroupItem
                                value={category.value}
                                id={category.value}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <p className="font-medium leading-none text-white">
                                  {category.label}
                                </p>
                                <p className="text-sm text-gray-300">
                                  {category.description}
                                </p>
                              </div>
                            </label>
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your name" 
                        {...field} 
                        className="bg-[#444444] border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        type="email" 
                        {...field} 
                        className="bg-[#444444] border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What would you like to tell us?" 
                        className="min-h-[100px] bg-[#444444] border-gray-600 text-white placeholder:text-gray-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="h-8 md:h-10 text-sm md:text-base bg-primary hover:bg-primary-hover">
                Send Message
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

