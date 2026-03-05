
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySelect } from "./CategorySelect";
import { ContactFormFields } from "./ContactFormFields";
import { FormValues, formSchema } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import * as DialogPrimitive from "@radix-ui/react-dialog";

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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Smooth blurred overlay */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          style={{
            animation: open ? 'contactFadeIn 0.2s ease-out' : undefined,
          }}
        />

        {/* Dialog content - custom smooth animation */}
        <DialogPrimitive.Content
          className={`fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] ${isMobile ? 'w-[calc(100%-2rem)] max-h-[90vh]' : 'w-[500px] max-h-[85vh]'} rounded-3xl overflow-hidden border-2 shadow-2xl p-0`}
          style={{
            borderColor: '#FF0000',
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            animation: open ? 'contactScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
          }}
        >
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors"
            style={{ borderColor: '#FF0000', color: '#FF0000', backgroundColor: 'white' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FF0000'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#FF0000'; }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: '2px solid #FF0000' }}>
            <div className="flex items-center gap-3 pr-10">
              <div className="w-11 h-11 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#FFCC00', backgroundColor: '#FFCC00' }}>
                <Send className="w-5 h-5" style={{ color: '#FF0000' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: '#FF0000' }}>Contact Us</h2>
                <p className="text-xs font-medium" style={{ color: '#FFCC00' }}>We'd love to hear from you</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pt-5 pb-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(90vh - 100px)' : 'calc(85vh - 100px)' }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <CategorySelect form={form} />
                <ContactFormFields form={form} />
                <button
                  type="submit"
                  className="w-full h-11 text-sm font-bold rounded-full border-2 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#FF0000', borderColor: '#FF0000', color: 'white' }}
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </Form>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      {/* Inline keyframes for smooth animation */}
      <style>{`
        @keyframes contactFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes contactScaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </DialogPrimitive.Root>
  );
};
