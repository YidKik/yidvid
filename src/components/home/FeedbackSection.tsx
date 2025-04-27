
import React from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

const feedbackItems = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ul-",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.",
  "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.",
  "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae.",
  "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus.",
];

export const FeedbackSection = () => {
  return (
    <section className="bg-[#135d66] py-16 overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-6xl font-sans font-bold text-[#ddf9f2] text-center mb-12">
          Feedback
        </h2>
        
        <InfiniteSlider duration={50} gap={16} className="py-4">
          {feedbackItems.map((feedback, index) => (
            <div
              key={index}
              className="w-[300px] shrink-0"
            >
              <div className="p-6 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] h-80 flex items-center justify-center">
                <p className="text-[#ddf9f2]">{feedback}</p>
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
