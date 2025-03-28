
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "@/components/contact/CategorySelect";
import { ContactFormFields } from "@/components/contact/ContactFormFields";
import { FormValues } from "@/components/contact/types";

interface ContactFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
}

export const ContactForm = ({ form, onSubmit }: ContactFormProps) => {
  return (
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
  );
};
