
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
      <DialogContent
        hideCloseButton
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-h-[90vh]' : 'w-[500px] max-h-[85vh]'} p-0 rounded-3xl overflow-hidden border-2 border-primary bg-background/80 backdrop-blur-2xl shadow-2xl`}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="px-6 pt-6 pb-4 border-b-2 border-primary">
          <div className="flex items-center gap-3 pr-10">
            <div className="w-11 h-11 rounded-full border-2 border-primary bg-accent flex items-center justify-center">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Contact Us</h2>
              <p className="text-xs text-muted-foreground">We'd love to hear from you</p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5 pb-6 overflow-y-auto bg-background/60" style={{ maxHeight: isMobile ? 'calc(90vh - 100px)' : 'calc(85vh - 100px)' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <CategorySelect form={form} />
              <ContactFormFields form={form} />
              <Button
                type="submit"
                className="w-full h-11 text-sm font-bold rounded-full border-2 border-primary !bg-primary !text-primary-foreground hover:!bg-primary/90 flex items-center justify-center gap-2"
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
