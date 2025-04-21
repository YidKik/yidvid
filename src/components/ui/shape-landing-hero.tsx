
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingAvatar } from "./floating-avatar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    const { scrollY } = useScroll();
    const [isMounted, setIsMounted] = useState(false);

    // Transform values for floating avatars
    const avatarY = useTransform(scrollY, [0, 500], [0, -200]);
    const avatarOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    
    // Transform values for text scaling
    const textScale = useTransform(scrollY, [0, 300], [1, 1.1]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    if (!isMounted) return null;

    return (
        <div className="relative min-h-[60vh] w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.15] via-transparent to-primary/[0.05] blur-3xl" />

            <motion.div 
                className="absolute inset-0 overflow-hidden"
                style={{ y: avatarY, opacity: avatarOpacity }}
            >
                <FloatingAvatar
                    imageUrl={channels[0]?.thumbnail_url}
                    delay={0.3}
                    size="xl"
                    className="left-[-20%] top-[15%]"
                />
                <FloatingAvatar
                    imageUrl={channels[1]?.thumbnail_url}
                    delay={0.5}
                    size="xl"
                    className="right-[-15%] top-[65%]"
                />
                <FloatingAvatar
                    imageUrl={channels[2]?.thumbnail_url}
                    delay={0.4}
                    size="xl"
                    className="left-[-18%] bottom-[5%]"
                />
                <FloatingAvatar
                    imageUrl={channels[3]?.thumbnail_url}
                    delay={0.6}
                    size="xl"
                    className="right-[-18%] top-[10%]"
                />
                <FloatingAvatar
                    imageUrl={channels[4]?.thumbnail_url}
                    delay={0.7}
                    size="lg"
                    className="left-[5%] top-[40%]"
                />
                <FloatingAvatar
                    imageUrl={channels[5]?.thumbnail_url}
                    delay={0.8}
                    size="lg"
                    className="right-[5%] bottom-[35%]"
                />
                <FloatingAvatar
                    imageUrl={channels[6]?.thumbnail_url}
                    delay={0.9}
                    size="lg"
                    className="left-[8%] top-[75%]"
                />
                <FloatingAvatar
                    imageUrl={channels[7]?.thumbnail_url}
                    delay={1}
                    size="lg"
                    className="right-[8%] bottom-[15%]"
                />
                <FloatingAvatar
                    imageUrl={channels[8]?.thumbnail_url}
                    delay={1.1}
                    size="md"
                    className="left-[12%] top-[25%]"
                />
            </motion.div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center justify-center gap-2 mb-8 md:mb-12"
                    >
                        <img 
                            src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
                            alt="YidVid Logo" 
                            className="h-12 w-auto"
                        />
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ scale: textScale }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                                {title1}
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary">
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ scale: textScale }}
                    >
                        <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                            Watch, share, and connect with the finest Jewish content from around the world.
                        </p>

                        <Link to="/videos">
                            <Button 
                                variant="default" 
                                size="lg" 
                                className="mx-auto mb-8 bg-primary hover:bg-primary/90 text-white font-medium"
                            >
                                Explore Videos
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
        </div>
    );
}
