
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
  
  // Fall back to new default content if no testimonials are available
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: "default-1",
      content: "Great selection of Jewish content, very user friendly.",
      author_name: "User",
      is_visible: true,
      display_order: 1
    },
    {
      id: "default-2",
      content: "This platform has become my go-to source for Jewish videos.",
      author_name: "User",
      is_visible: true,
      display_order: 2
    },
    {
      id: "default-3",
      content: "What an amazing platform! The content is exactly what I was looking for.",
      author_name: "User",
      is_visible: true,
      display_order: 3
    },
    {
      id: "default-4",
      content: "Great selection of Jewish content, very user friendly.",
      author_name: "User",
      is_visible: true,
      display_order: 4
    },
  ];

  return (
    <section className="bg-[#135d66] py-12 overflow-hidden">
      <div className="container mx-auto px-8">
        <h2 className="text-5xl font-sans font-bold text-[#ddf9f2] text-center mb-10">
          Feedback
        </h2>
        
        <InfiniteSlider duration={50} gap={24} className="py-4">
          {displayTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-[450px] shrink-0"
            >
              <div className="p-6 rounded-2xl border-3 border-[#ddf9f2] bg-[#003c43] h-40 flex flex-col items-center justify-center">
                <p className="text-[#ddf9f2] text-lg mb-4 line-clamp-4">{testimonial.content}</p>
                {testimonial.author_name && (
                  <p className="text-[#77b0aa] text-base mt-auto">- {testimonial.author_name}</p>
                )}
              </div>
            </div>
          ))}
        </InfiniteSlider>

        <div className="flex justify-center gap-3 mt-5">
          {[0, 1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-3 h-3 rounded-full bg-[#ddf9f2]/40 first:bg-[#ddf9f2] first:scale-125"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
