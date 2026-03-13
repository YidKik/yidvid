import { useState, useEffect, useRef } from "react";
import yvLogoIcon from "@/assets/yv-logo-icon.png";
import { playSignatureSound } from "../utils/signatureSound";

type BrandingPhase = "hidden" | "intro" | "outro";

interface VideoPlayerBrandingProps {
  isLoading: boolean;
  isReady: boolean;
  isPlaying: boolean;
  hasEnded: boolean;
  onIntroComplete: () => void;
  onOutroComplete: () => void;
}

export const VideoPlayerBranding = ({
  isLoading,
  isReady,
  isPlaying,
  hasEnded,
  onIntroComplete,
  onOutroComplete,
}: VideoPlayerBrandingProps) => {
  const [phase, setPhase] = useState<BrandingPhase>("hidden");
  const [animClass, setAnimClass] = useState("");
  const introShownRef = useRef(false);
  const outroShownRef = useRef(false);
  const soundPlayedRef = useRef(false);

  // INTRO: Show logo while loading, fade out when ready
  useEffect(() => {
    if (isLoading && !introShownRef.current) {
      introShownRef.current = true;
      soundPlayedRef.current = false;
      setPhase("intro");
      setAnimClass("animate-in");
    }
  }, [isLoading]);

  // Play sound once logo is visible
  useEffect(() => {
    if (phase === "intro" && animClass === "animate-in" && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      // Small delay so the logo is visible first
      const t = setTimeout(() => playSignatureSound(0.12), 150);
      return () => clearTimeout(t);
    }
  }, [phase, animClass]);

  // When ready, fade out intro
  useEffect(() => {
    if (isReady && phase === "intro") {
      setAnimClass("animate-out");
      const t = setTimeout(() => {
        setPhase("hidden");
        setAnimClass("");
        onIntroComplete();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isReady, phase, onIntroComplete]);

  // OUTRO: Show logo briefly when video ends
  useEffect(() => {
    if (hasEnded && !outroShownRef.current) {
      outroShownRef.current = true;
      setPhase("outro");
      setAnimClass("animate-in");
      playSignatureSound(0.1);

      // Fade out after 1.2s
      const t = setTimeout(() => {
        setAnimClass("animate-out");
        const t2 = setTimeout(() => {
          setPhase("hidden");
          setAnimClass("");
          onOutroComplete();
        }, 600);
        return () => clearTimeout(t2);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [hasEnded, onOutroComplete]);

  // Reset outro flag when a new video starts playing
  useEffect(() => {
    if (isPlaying && outroShownRef.current) {
      outroShownRef.current = false;
    }
  }, [isPlaying]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center bg-black/70 pointer-events-none transition-opacity duration-500 ${
        animClass === "animate-out" ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={yvLogoIcon}
        alt="YV"
        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl shadow-2xl transition-all duration-500 ${
          animClass === "animate-in"
            ? "scale-100 opacity-100"
            : animClass === "animate-out"
            ? "scale-90 opacity-0"
            : "scale-75 opacity-0"
        }`}
        style={{
          filter: "drop-shadow(0 0 20px rgba(255, 0, 0, 0.3))",
        }}
      />
    </div>
  );
};
