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
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySelect } from "./CategorySelect";
import { ContactFormFields } from "./ContactFormFields";
import { FormValues, formSchema } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

export const ContactDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
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

      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting contact request:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="icon"
          className={`${isMobile ? 'h-7 w-7 rounded-full bg-white/90 shadow-sm border border-[#ea384c]' : 'h-7 w-7 md:h-10 md:w-10'}`}
        >
          <MessageSquare className={`${isMobile ? 'h-3.5 w-3.5 text-black' : 'h-3.5 w-3.5 md:h-5 md:w-5'}`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(calc(100%-2rem),400px)] md:w-[450px] p-0 bg-[#333333] text-white border-gray-600 rounded-lg mx-auto my-2 md:my-4">
        <DialogHeader className="p-3 md:p-4 border-b border-gray-600">
          <DialogTitle className="text-base md:text-lg text-white">Contact Us</DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-gray-300 mt-1">
            How can we help you today? Choose a category below and send us your message.
          </DialogDescription>
        </DialogHeader>
        <div className="p-3 md:p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
              <CategorySelect form={form} />
              <ContactFormFields form={form} />
              <div className="pt-1 md:pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-8 md:h-9 text-xs md:text-sm bg-primary hover:bg-primary-hover transition-colors"
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
