
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TestimonialsTable } from "@/components/admin/testimonials/TestimonialsTable";
import { TestimonialDialog } from "@/components/admin/testimonials/TestimonialDialog";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BackButton } from "@/components/navigation/BackButton";
import { toast } from "sonner";

export default function TestimonialsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);

  // Fetch all testimonials, not just visible ones
  const { data: testimonials, refetch } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order');
      
      if (error) {
        toast.error("Failed to load testimonials");
        throw error;
      }
      return data;
    }
  });

  const handleAdd = () => {
    setSelectedTestimonial(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (testimonial: any) => {
    setSelectedTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-12 space-y-8 px-4">
      <BackButton />
      <div className="flex justify-between items-center">
        <DashboardHeader title="Manage Testimonials" />
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {testimonials && (
        <TestimonialsTable 
          testimonials={testimonials}
          onEdit={handleEdit}
          onRefetch={refetch}
        />
      )}

      <TestimonialDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        testimonial={selectedTestimonial}
        onSuccess={refetch}
      />
    </div>
  );
}
