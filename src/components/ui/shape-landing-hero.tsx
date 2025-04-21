
"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingAvatar } from "./floating-avatar";

export function HeroGeometric({
    badge = "YidVid",
    title1 = "Your Gateway to",
    title2 = "Jewish Content",
    channels = []
}: {
    badge?: string;
    title1?: string;
    title2?: string;
    channels?: any[];
}) {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <div className="relative min-h-[60vh] w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.15] via-transparent to-primary/[0.05] blur-3xl" />

            <div className="absolute inset-0 overflow-hidden">
                <FloatingAvatar
                    imageUrl={channels[0]?.thumbnail_url}
                    delay={0.3}
                    size="lg"
                    className="left-[-5%] top-[20%]"
                />
                <FloatingAvatar
                    imageUrl={channels[1]?.thumbnail_url}
                    delay={0.5}
                    size="md"
                    className="right-[5%] top-[70%]"
                />
                <FloatingAvatar
                    imageUrl={channels[2]?.thumbnail_url}
                    delay={0.4}
                    size="lg"
                    className="left-[10%] bottom-[10%]"
                />
                <FloatingAvatar
                    imageUrl={channels[3]?.thumbnail_url}
                    delay={0.6}
                    size="sm"
                    className="right-[20%] top-[15%]"
                />
                <FloatingAvatar
                    imageUrl={channels[4]?.thumbnail_url}
                    delay={0.7}
                    size="md"
                    className="left-[25%] top-[10%]"
                />
                {/* Additional floating avatars */}
                <FloatingAvatar
                    imageUrl={channels[5]?.thumbnail_url}
                    delay={0.8}
                    size="lg"
                    className="right-[15%] bottom-[20%]"
                />
                <FloatingAvatar
                    imageUrl={channels[6]?.thumbnail_url}
                    delay={0.9}
                    size="lg"
                    className="left-[40%] top-[15%]"
                />
                <FloatingAvatar
                    imageUrl={channels[7]?.thumbnail_url}
                    delay={1}
                    size="lg"
                    className="right-[35%] bottom-[25%]"
                />
                <FloatingAvatar
                    imageUrl={channels[8]?.thumbnail_url}
                    delay={1.1}
                    size="lg"
                    className="left-[15%] top-[60%]"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
                    >
                        <Circle className="h-2 w-2 fill-primary/80" />
                        <span className="text-sm text-white/60 tracking-wide">
                            {badge}
                        </span>
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                                {title1}
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-300 via-white/90 to-primary-300">
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                            Watch, share, and connect with the finest Jewish content from around the world.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
        </div>
    );
}
