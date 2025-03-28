
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySelect } from "@/components/contact/CategorySelect";
import { ContactFormFields } from "@/components/contact/ContactFormFields";
import { FormValues, formSchema } from "@/components/contact/types";
import { useIsMobile } from "@/hooks/useIsMobile";

export const SupportSection = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'general',
      name: "",
      email: "",
      message: "",
    },
  });
  const isMobile = useIsMobile();

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
    } catch (error) {
      console.error("Error submitting contact request:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-primary/80">Help & Support</h2>
      <Card className="p-6 border-primary/20 shadow-sm">
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Need help or have suggestions? We're here to assist you.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CategorySelect form={form} />
            <ContactFormFields form={form} />
            
            <Button 
              type="submit" 
              className="w-full transition-all duration-200 hover:shadow-md"
            >
              Send Message
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};
