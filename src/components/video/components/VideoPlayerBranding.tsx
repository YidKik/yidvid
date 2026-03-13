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
  const hasPlayedOnceRef = useRef(false);
  const outroShownRef = useRef(false);

  // INTRO: Show logo only after user clicks play (isPlaying becomes true for the first time)
  // and the player was still buffering/loading
  useEffect(() => {
    if (isPlaying && !hasPlayedOnceRef.current) {
      hasPlayedOnceRef.current = true;
      setPhase("intro");
      setAnimClass("animate-in");
      // Play sound after a brief moment so logo is visible first
      setTimeout(() => playSignatureSound(0.12), 150);
    }
  }, [isPlaying]);

  // When ready & playing, fade out intro after a short display
  useEffect(() => {
    if (phase === "intro" && isPlaying && isReady) {
      // Show logo for at least 0.8s before fading
      const t = setTimeout(() => {
        setAnimClass("animate-out");
        const t2 = setTimeout(() => {
          setPhase("hidden");
          setAnimClass("");
          onIntroComplete();
        }, 600);
        return () => clearTimeout(t2);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [phase, isPlaying, isReady, onIntroComplete]);

  // OUTRO: Show logo briefly when video ends
  useEffect(() => {
    if (hasEnded && !outroShownRef.current) {
      outroShownRef.current = true;
      setPhase("outro");
      setAnimClass("animate-in");
      playSignatureSound(0.1);

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

  // Reset outro flag when video replays
  useEffect(() => {
    if (isPlaying && outroShownRef.current) {
      outroShownRef.current = false;
    }
  }, [isPlaying]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center bg-black/60 pointer-events-none transition-opacity duration-500 ${
        animClass === "animate-out" ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={yvLogoIcon}
        alt="YV"
        className={`object-contain transition-all duration-500 ${
          animClass === "animate-in"
            ? "scale-100 opacity-100"
            : animClass === "animate-out"
            ? "scale-90 opacity-0"
            : "scale-75 opacity-0"
        }`}
        style={{
          width: "120px",
          height: "120px",
          filter: "drop-shadow(0 0 24px rgba(255, 0, 0, 0.25))",
        }}
      />
    </div>
  );
};
