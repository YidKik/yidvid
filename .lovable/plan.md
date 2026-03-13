

# New Logo Icon Animation Plan

## Current State
The `AnimatedPlayLogo.tsx` component animates a play-button triangle split into 3 vertical slices that slide in from the left, then crossfades to the static logo PNG. This no longer matches the new "YV" rounded-square logo.

## New Logo Anatomy
The new logo consists of:
1. **Rounded red rectangle** -- the container/background shape
2. **"Y" letterform** -- cut out in white on the left side
3. **"V" letterform** -- cut out in white on the right side, with a diagonal slash through it

## Animation Concept: "Pieces Assemble"

The animation will reconstruct the logo from its distinct geometric pieces, each arriving from different directions and snapping into place:

**Phase 1 (0-0.6s) -- Background shape forms:**
- The rounded rectangle builds from the center outward -- starts as a thin vertical line that expands horizontally with a spring bounce, forming the red container

**Phase 2 (0.6-1.4s) -- Letters arrive as separate strokes:**
- The "Y" is split into 3 strokes: left diagonal arm, right diagonal arm, and vertical stem. Each slides in from a different direction (left arm from top-left, right arm from top-right, stem from bottom) and connects at the junction point
- The "V" arrives as 2 diagonal strokes: left stroke from top, right stroke from bottom-right, meeting at the bottom vertex
- The diagonal slash through the "V" swipes across last

**Phase 3 (1.4-1.8s) -- Polish:**
- A subtle shine/gloss sweep moves across the completed logo
- Soft yellow and red glow pulses behind the logo once

**Phase 4 (1.8-2.2s) -- Crossfade to static PNG:**
- The SVG animation fades and scales slightly, replaced by the actual `yidvid-logo-icon.png` for pixel-perfect branding consistency

## Background Effects
- Keep the subtle yellow (`rgba(255, 204, 0, 0.15)`) and red (`rgba(255, 0, 0, 0.1)`) soft glow behind the logo throughout, matching the current homepage dark background

## Technical Approach

**Single file change:** Replace the contents of `src/components/home/AnimatedPlayLogo.tsx`

- All animation built with **Framer Motion** `motion.path` and `motion.rect` inside an SVG viewBox
- The "Y" and "V" shapes are defined as SVG paths that closely match the logo's actual geometry
- Each stroke is a separate `<motion.path>` with staggered `custom` delay indexes
- The crossfade to the static PNG at the end uses the same `AnimatePresence` pattern already in place
- The `className` prop pass-through and sizing behavior remain identical -- no changes needed in `HeroSearchSection.tsx`

**Asset:** Copy the uploaded `Logo-02_1_big-2.png` to replace the existing icon files at `src/assets/yidvid-logo-icon.png` and `public/yidvid-logo-icon.png`

## Files to Modify
1. `src/components/home/AnimatedPlayLogo.tsx` -- Complete rewrite of SVG paths and animation sequences
2. `src/assets/yidvid-logo-icon.png` -- Replace with new uploaded logo
3. `public/yidvid-logo-icon.png` -- Replace with new uploaded logo

