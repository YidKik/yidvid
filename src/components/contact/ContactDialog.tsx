
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Mail, Send, X } from "lucide-react";
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
      <DialogContent
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-h-[90vh]' : 'w-[520px] max-h-[85vh]'} p-0 border-none rounded-2xl overflow-hidden bg-white shadow-2xl`}
        style={{
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header with brand red accent */}
        <div className="relative bg-primary px-6 pt-8 pb-10">
          {/* Decorative circles */}
          <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-2 border-white/20" />
          <div className="absolute -bottom-6 right-8 w-20 h-20 rounded-full border-2 border-white/10" />
          <div className="absolute top-2 right-20 w-8 h-8 rounded-full bg-white/10" />

          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Contact Us</h2>
              <p className="text-white/80 text-sm mt-0.5">We'd love to hear from you</p>
            </div>
          </div>
        </div>

        {/* Form area with overlap effect */}
        <div className="relative -mt-4 bg-white rounded-t-2xl px-6 pt-6 pb-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(90vh - 120px)' : 'calc(85vh - 120px)' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <CategorySelect form={form} />
              <ContactFormFields form={form} />
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-full transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2"
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
