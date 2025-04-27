
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TestimonialFormData {
  id?: string;
  content: string;
  author_name: string;
  display_order: number;
  is_visible: boolean;
}

export const TestimonialDialog = ({
  isOpen,
  onClose,
  testimonial,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  testimonial?: TestimonialFormData;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState<TestimonialFormData>(
    testimonial || {
      content: "",
      author_name: "",
      display_order: 0,
      is_visible: true
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (testimonial?.id) {
        const { error } = await supabase
          .from('testimonials')
          .update(formData)
          .eq('id', testimonial.id);
        
        if (error) throw error;
        toast.success("Testimonial updated successfully");
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(formData);
        
        if (error) throw error;
        toast.success("Testimonial added successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast.error("Failed to save testimonial");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-black">
            {testimonial?.id ? "Edit Testimonial" : "Add New Testimonial"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <div className="space-y-2">
            <Label htmlFor="content" className="text-black">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              className="text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author" className="text-black">Author Name</Label>
            <Input
              id="author"
              value={formData.author_name}
              onChange={e => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              required
              className="text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order" className="text-black">Display Order</Label>
            <Input
              id="order"
              type="number"
              min="0"
              value={formData.display_order}
              onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
              required
              className="text-black"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
