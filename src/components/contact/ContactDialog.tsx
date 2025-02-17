
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
import { Form } from "@/components/ui/form";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySelect } from "./CategorySelect";
import { ContactFormFields } from "./ContactFormFields";
import { FormValues, formSchema } from "./types";

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
          variant="ghost" 
          size="icon"
          className="h-7 w-7 md:h-10 md:w-10"
        >
          <MessageSquare className="h-3.5 w-3.5 md:h-5 md:w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(calc(100%-2rem),400px)] p-0 bg-[#333333] text-white border-gray-600 rounded-lg mx-auto my-2 md:my-4">
        <DialogHeader className="p-3 md:p-6 border-b border-gray-600">
          <DialogTitle className="text-base md:text-xl text-white">Contact Us</DialogTitle>
          <DialogDescription className="text-xs md:text-base text-gray-300 mt-1">
            How can we help you today? Choose a category below and send us your message.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(100vh-140px)] md:max-h-none p-3 md:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-6">
              <CategorySelect form={form} />
              <ContactFormFields form={form} />
              <div className="pt-1 md:pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-8 md:h-10 text-xs md:text-base bg-primary hover:bg-primary-hover transition-colors"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
