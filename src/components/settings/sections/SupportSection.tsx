
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/components/contact/types";
import { useIsMobile } from "@/hooks/use-mobile";
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

      // Send email notification to admins
      if (insertedRequest) {
        const { error: emailError } = await supabase.functions.invoke("send-contact-notifications", {
          body: {
            type: "new_request",
            requestId: insertedRequest.id
          }
        });

        if (emailError) {
          console.error("Email notification error:", emailError);
          // Don't fail the whole operation if email fails
        }
      }

      form.reset();
      toast.success("Your message has been sent!");
    } catch (error) {
      console.error("Error submitting contact request:", error);
      toast.error("Failed to send your message. Please try again.");
    }
  };

  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg rounded-3xl bg-gradient-to-br from-white to-primary/5">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-2xl">
            <div className="w-6 h-6 text-primary">🎧</div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-primary">Help & Support</h2>
            <p className="text-sm text-muted-foreground">Get help or send us your feedback</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Need help or have suggestions? We're here to assist you.
            </p>
          </div>
          
          <ContactForm form={form} onSubmit={onSubmit} />
        </div>
      </div>
    </Card>
  );
};
