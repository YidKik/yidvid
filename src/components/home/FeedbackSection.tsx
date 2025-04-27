
import React, { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useCarouselScroll } from '@/hooks/carousel/useCarouselScroll';
import useEmblaCarousel from "embla-carousel-react";

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
  const [api, setApi] = useState<any>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
  });

  useCarouselScroll({
    emblaApi,
    direction: "ltr",
    speed: 0.5,
    itemsLength: feedbackItems.length,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  return (
    <section className="bg-[#135d66] py-16 overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-6xl font-sans font-bold text-[#ddf9f2] text-center mb-12">
          Feedback
        </h2>
        
        <Carousel
          ref={emblaRef}
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {feedbackItems.map((feedback, index) => (
              <CarouselItem key={index} className="basis-1/4 pl-4">
                <div
                  className="p-6 rounded-3xl border-2 border-[#ddf9f2] bg-[#003c43] h-80 flex items-center justify-center"
                >
                  <p className="text-[#ddf9f2]">{feedback}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                selectedIndex === dot
                  ? "bg-[#ddf9f2] scale-125"
                  : "bg-[#ddf9f2]/40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
