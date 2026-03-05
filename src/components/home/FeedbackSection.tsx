
import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export const FeedbackSection = () => {
  const feedbackData = [
    { text: "YidVid makes it so easy to find quality kosher content for my family. We use it every Motzei Shabbos!", author: "Sarah K." },
    { text: "Finally a platform where I don't have to worry about what my kids might stumble upon. Thank you!", author: "Moshe R." },
    { text: "The variety of Torah shiurim and music videos is incredible. This is exactly what we needed.", author: "Chana L." },
    { text: "I love how up-to-date the content is. New videos appear so quickly after being uploaded.", author: "David B." }
  ];

  return (
    <section className="bg-[#003c43] py-20">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-[#ddf9f2] text-center mb-4"
        >
          What People Are Saying
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#77b0aa] text-center mb-14 text-lg"
        >
          Hear from our growing community
        </motion.p>
        
        <motion.div 
          className="w-full max-w-6xl mx-auto overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            className="flex gap-6"
            animate={{ x: [0, -400, -800, -1200, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...feedbackData, ...feedbackData].map((feedback, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#135d66]/60 to-[#0e4a52]/40 border border-[#77b0aa]/20 rounded-2xl p-6 w-80 h-40 flex-shrink-0 flex flex-col justify-between backdrop-blur-sm"
              >
                <div className="flex gap-3">
                  <Quote className="w-5 h-5 text-[#77b0aa]/50 flex-shrink-0 mt-0.5" />
                  <p className="text-[#e3fef7]/90 text-sm leading-relaxed">{feedback.text}</p>
                </div>
                <p className="text-[#77b0aa] text-xs font-medium text-right mt-2">— {feedback.author}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
