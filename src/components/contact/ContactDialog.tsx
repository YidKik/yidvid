import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySelect } from "./CategorySelect";
import { ContactFormFields } from "./ContactFormFields";
import { ContactSuccessOverlay } from "./ContactSuccessOverlay";
import { FormValues, formSchema } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ContactDialog = ({ open, onOpenChange }: ContactDialogProps) => {
  const { isMobile } = useIsMobile();
  const { user } = useUnifiedAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'general',
      name: "",
      email: "",
      message: "",
    },
  });

  // Autofill from profile
  useEffect(() => {
    if (!user?.id || !open) return;
    const prefill = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, name, username, email")
        .eq("id", user.id)
        .single();
      if (profile) {
        form.setValue("name", profile.display_name || profile.name || profile.username || "");
        form.setValue("email", profile.email || user.email || "");
      }
    };
    prefill();
  }, [user?.id, open]);

  const onSubmit = (data: FormValues) => {
    // Immediately show success animation (optimistic)
    onOpenChange(false);
    setShowSuccess(true);
    form.setValue("message", "");

    // Send in background - don't block the UI
    (async () => {
      try {
        const authUser = await supabase.auth.getUser();
        const { data: insertedRequest, error } = await supabase
          .from("contact_requests")
          .insert({
            category: data.category,
            name: data.name,
            email: data.email,
            message: data.message,
            user_id: authUser.data.user?.id,
          })
          .select()
          .single();

        if (error) throw error;

        if (insertedRequest) {
          supabase.functions.invoke("send-contact-notifications", {
            body: { type: "new_request", requestId: insertedRequest.id }
          }).catch(e => console.error("Email notification error:", e));

          // Send confirmation email to user
          supabase.functions.invoke('send-transactional-email', {
            body: {
              templateName: 'contact-request-confirmation',
              recipientEmail: data.email,
              idempotencyKey: `contact-confirm-${insertedRequest.id}`,
              templateData: { name: data.name },
            },
          }).catch(err => console.error('Failed to send contact confirmation email:', err));
        }
      } catch (error) {
        console.error("Error submitting contact request:", error);
      }
    })();
  };

  const handleSuccessComplete = useCallback(() => {
    setShowSuccess(false);
  }, []);

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            style={{
              animation: open ? 'contactFadeIn 0.2s ease-out' : undefined,
            }}
          />

          <DialogPrimitive.Content
            className={`fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] ${isMobile ? 'w-[calc(100%-2rem)] max-h-[75vh]' : 'w-[480px] max-h-[85vh]'} rounded-2xl overflow-hidden shadow-xl p-0`}
            style={{
              border: '1px solid #E5E5E5',
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(24px)',
              animation: open ? 'contactScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
            }}
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ color: '#666' }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <div className={`${isMobile ? 'px-4 pt-4 pb-3' : 'px-6 pt-6 pb-4'}`} style={{ borderBottom: '1px solid #E5E5E5' }}>
              <div className="flex items-center gap-3 pr-10">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center`} style={{ backgroundColor: '#FFCC00' }}>
                  <Send className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'}`} style={{ color: '#222' }} />
                </div>
                <div>
                  <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold tracking-tight`} style={{ color: '#222' }}>Contact Us</h2>
                  <p className={`${isMobile ? 'text-[10px]' : 'text-xs'}`} style={{ color: '#999' }}>We'd love to hear from you</p>
                </div>
              </div>
            </div>

            <div className={`${isMobile ? 'px-4 pt-3 pb-4' : 'px-6 pt-5 pb-6'} overflow-y-auto`} style={{ maxHeight: isMobile ? 'calc(75vh - 80px)' : 'calc(85vh - 100px)' }}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={`${isMobile ? 'space-y-3' : 'space-y-5'}`}>
                  <CategorySelect form={form} />
                  <ContactFormFields form={form} />
                  <button
                    type="submit"
                    className={`w-full ${isMobile ? 'h-9 text-xs' : 'h-11 text-sm'} font-bold rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-90`}
                    style={{ backgroundColor: '#FF0000', color: 'white' }}
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              </Form>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>

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

      {/* Full-screen success overlay */}
      <ContactSuccessOverlay show={showSuccess} onComplete={handleSuccessComplete} />
    </>
  );
};
