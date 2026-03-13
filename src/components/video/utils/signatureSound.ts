/**
 * YV Signature Sound - a short, friendly chime using Web Audio API.
 * Plays a gentle two-note ascending tone (~0.6s total).
 */

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

export const playSignatureSound = (volume = 0.15): void => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Master gain (keep it subtle)
    const master = ctx.createGain();
    master.gain.setValueAtTime(volume, now);
    master.connect(ctx.destination);

    // Note 1: soft chime (C5 = 523 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.8, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(master);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Note 2: higher chime (E5 = 659 Hz), slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.6, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(master);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);

    // Soft shimmer overtone (G5 = 784 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(784, now + 0.18);
    gain3.gain.setValueAtTime(0, now + 0.18);
    gain3.gain.linearRampToValueAtTime(0.3, now + 0.22);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc3.connect(gain3);
    gain3.connect(master);
    osc3.start(now + 0.18);
    osc3.stop(now + 0.55);
  } catch {
    // Silently fail if audio isn't available
  }
};
