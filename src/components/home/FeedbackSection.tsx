
import React, { useEffect, useState } from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  content: string;
  author_name: string | null;
  is_visible: boolean;
  display_order: number;
}

export const FeedbackSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_visible', true)
          .order('display_order');
          
        if (error) {
          console.error('Error fetching testimonials:', error);
          return;
        }
        
        setTestimonials(data || []);
      } catch (err) {
        console.error('Error in testimonial fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestimonials();
  }, []);
  
  // Fall back to default content if no testimonials are available
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: "default-1",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-",
      author_name: "Default User",
      is_visible: true,
      display_order: 1
    },
    {
      id: "default-2",
      content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
      author_name: "Default User",
      is_visible: true,
      display_order: 2
    },
    {
      id: "default-3",
      content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo.",
      author_name: "Default User",
      is_visible: true,
      display_order: 3
    },
  ];

  return (
    <section className="bg-[#135d66] py-16 overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-6xl font-sans font-bold text-[#ddf9f2] text-center mb-12">
          Feedback
        </h2>
        
        <InfiniteSlider duration={50} gap={16} className="py-4">
          {displayTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-[300px] shrink-0"
            >
              <div className="p-6 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] h-80 flex flex-col items-center justify-center">
                <p className="text-[#ddf9f2] mb-4">{testimonial.content}</p>
                {testimonial.author_name && (
                  <p className="text-[#77b0aa] text-sm mt-auto">- {testimonial.author_name}</p>
                )}
              </div>
            </div>
          ))}
        </InfiniteSlider>

        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 rounded-full bg-[#ddf9f2]/40 first:bg-[#ddf9f2] first:scale-125"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
