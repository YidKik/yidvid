
import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { fadeInVariants } from '@/components/home/mobile/animation-utils';
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  content: string;
  author_name: string | null;
  is_visible: boolean;
  display_order: number;
}

export const MobileFeedbackSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
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
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      author_name: "Default User",
      is_visible: true,
      display_order: 1
    },
    {
      id: "default-2",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
      author_name: "Default User",
      is_visible: true,
      display_order: 2
    },
    {
      id: "default-3",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
      author_name: "Default User",
      is_visible: true,
      display_order: 3
    },
  ];

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const scrollPosition = container.scrollLeft;
    const itemWidth = container.clientWidth * 0.75; // 75vw width of each item
    const newIndex = Math.round(scrollPosition / itemWidth);
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration: 0.6 }}
      className="mt-12 mb-8 bg-[#135d66] py-8"
    >
      <h2 className="text-[#e3fef7] text-2xl font-bold text-center mb-6">Feedback</h2>
      
      <div className="relative">
        <div 
          className="overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          <div className="flex gap-4">
            {displayTestimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className="w-[75vw] flex-shrink-0 first:ml-4 last:mr-4 snap-center"
              >
                <div className="border border-[#ddf9f2] rounded-3xl p-5 bg-[#135d66] min-h-[160px] flex flex-col">
                  <p className="text-[#e3fef7] text-sm leading-relaxed">
                    {testimonial.content}
                  </p>
                  {testimonial.author_name && (
                    <p className="text-[#77b0aa] text-xs mt-auto pt-3">- {testimonial.author_name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-4">
          {displayTestimonials.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index === activeIndex ? 'bg-[#e3fef7]' : 'bg-[#77b0aa]'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
