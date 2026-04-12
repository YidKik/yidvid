import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/components/contact/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContactForm } from "@/components/contact/ContactForm";
import { toast } from "sonner";
import { HelpCircle, MessageSquare } from "lucide-react";

export const SupportSection = () => {
  const isMobile = useIsMobile();
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
    } catch (error) {
      toast.error("Failed to send your message. Please try again.");
    }
  };

  return (
    <div style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}>
      {/* Section Header */}
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
    </div>
  );
};
