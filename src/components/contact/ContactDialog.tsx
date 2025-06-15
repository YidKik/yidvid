
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { MessageSquare, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySelect } from "./CategorySelect";
import { ContactFormFields } from "./ContactFormFields";
import { FormValues, formSchema } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ContactDialog = ({ open, onOpenChange }: ContactDialogProps) => {
  const { isMobile } = useIsMobile();
  
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

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting contact request:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'w-[calc(100%-2rem)]' : 'w-[550px]'} p-0 bg-[#333333] text-white border-gray-600 rounded-lg`}>
        <DialogHeader className="p-4 border-b border-gray-600 relative">
          <DialogTitle className="text-base md:text-lg text-white">Contact Us</DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-gray-300 mt-1">
            How can we help you today? Choose a category below and send us your message.
          </DialogDescription>
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-[#ea384c]"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CategorySelect form={form} />
              <ContactFormFields form={form} />
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-9 text-sm bg-primary hover:bg-primary-hover transition-colors"
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
