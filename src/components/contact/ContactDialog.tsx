
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Send, X } from "lucide-react";
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
      const { data: insertedRequest, error } = await supabase
        .from("contact_requests")
        .insert({
          category: data.category,
          name: data.name,
          email: data.email,
          message: data.message,
          user_id: user.data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (insertedRequest) {
        const { error: emailError } = await supabase.functions.invoke("send-contact-notifications", {
          body: {
            type: "new_request",
            requestId: insertedRequest.id
          }
        });

        if (emailError) {
          console.error("Email notification error:", emailError);
        }
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting contact request:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Blurred overlay */}
      <div className={`${open ? 'fixed inset-0 z-40 backdrop-blur-md bg-black/40' : 'hidden'}`} />

      <DialogContent
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-h-[90vh]' : 'w-[480px] max-h-[85vh]'} p-0 border-2 border-primary rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl shadow-[0_0_60px_rgba(255,0,0,0.15)] z-50`}
      >
        {/* Decorative corner circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-[3px] border-[#FFCC00] pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full border-[3px] border-primary pointer-events-none" />
        <div className="absolute top-16 -right-3 w-10 h-10 rounded-full border-2 border-primary/40 pointer-events-none" />
        <div className="absolute -bottom-2 right-12 w-8 h-8 rounded-full border-2 border-[#FFCC00]/50 pointer-events-none" />

        {/* Close button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full border-2 border-primary bg-white hover:bg-primary hover:text-white text-primary transition-all duration-200 flex items-center justify-center"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border-2 border-[#FFCC00] bg-[#FFCC00]/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Contact Us</h2>
              <p className="text-xs text-muted-foreground">We'd love to hear from you</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-[2px] bg-gradient-to-r from-primary via-[#FFCC00] to-primary rounded-full" />

        {/* Form */}
        <div className="px-6 pt-5 pb-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(90vh - 100px)' : 'calc(85vh - 100px)' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <CategorySelect form={form} />
              <ContactFormFields form={form} />
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-full transition-all duration-200 flex items-center justify-center gap-2 border-2 border-primary hover:border-primary/90"
              >
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
