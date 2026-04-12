import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/components/contact/types";
import { ContactForm } from "@/components/contact/ContactForm";
import { toast } from "sonner";
import { HelpCircle } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export const SettingsSupport = () => {
  const { user } = useUnifiedAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { category: "general", name: "", email: "", user_id_display: "", message: "" },
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
        await supabase.functions.invoke("send-contact-notifications", {
          body: { type: "new_request", requestId: insertedRequest.id }
        }).catch(() => {});

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
      form.reset();
      toast.success("Your message has been sent!");
    } catch {
      toast.error("Failed to send your message. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-[#FF0000]" />
        <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#e8e8e8]">Help & Support</h3>
      </div>
      <p className="text-sm text-[#666] dark:text-[#aaa] mb-5">
        Need help or have suggestions? Send us a message and we'll get back to you.
      </p>
      <ContactForm form={form} onSubmit={onSubmit} />
    </div>
  );
};