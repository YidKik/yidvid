
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/components/contact/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ContactForm } from "@/components/contact/ContactForm";
import { toast } from "sonner";

export const SupportSection = () => {
  const isMobile = useIsMobile();
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

      form.reset();
      toast.success("Your message has been sent!");
    } catch (error) {
      console.error("Error submitting contact request:", error);
      toast.error("Failed to send your message. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-primary/80">Help & Support</h2>
      <Card className={`p-4 md:p-6 border-primary/20 shadow-sm ${isMobile ? 'mx-1 px-2' : ''}`}>
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Need help or have suggestions? We're here to assist you.
          </p>
        </div>
        
        <ContactForm form={form} onSubmit={onSubmit} />
      </Card>
    </div>
  );
};
