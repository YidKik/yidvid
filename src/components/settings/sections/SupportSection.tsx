import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/components/contact/types";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSuccessOverlay } from "@/components/contact/ContactSuccessOverlay";
import { HelpCircle, MessageSquare } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export const SupportSection = () => {
  const { user } = useUnifiedAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'general',
      name: "",
      email: "",
      user_id_display: "",
      message: "",
    },
  });

  useEffect(() => {
    const prefill = async () => {
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, name, username, email")
        .eq("id", user.id)
        .single();
      if (profile) {
        form.setValue("name", profile.display_name || profile.name || profile.username || "");
        form.setValue("email", profile.email || user.email || "");
        form.setValue("user_id_display", user.id);
      }
    };
    prefill();
  }, [user?.id]);

  const onSubmit = async (data: FormValues) => {
    setShowSuccess(true);
    form.setValue("message", "");

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
        }).catch(() => {});

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
  };

  const handleSuccessComplete = useCallback(() => {
    setShowSuccess(false);
  }, []);

  return (
    <div style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}>
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
        <HelpCircle size={18} className="text-yellow-600" />
        <h2 className="text-lg font-bold text-gray-900">Help & Support</h2>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={14} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Contact Us</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Need help or have suggestions? Send us a message and we'll get back to you.
        </p>
        <ContactForm form={form} onSubmit={onSubmit} />
      </div>

      <ContactSuccessOverlay show={showSuccess} onComplete={handleSuccessComplete} />
    </div>
  );
};
