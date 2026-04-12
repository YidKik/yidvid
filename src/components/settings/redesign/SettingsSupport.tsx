import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/components/contact/types";
import { ContactForm } from "@/components/contact/ContactForm";
import { toast } from "sonner";
import { HelpCircle, MessageSquare } from "lucide-react";

export const SettingsSupport = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { category: "general", name: "", email: "", message: "" },
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
        await supabase.functions.invoke("send-contact-notifications", {
          body: { type: "new_request", requestId: insertedRequest.id }
        }).catch(() => {});
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
