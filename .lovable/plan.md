

## Problem

The YouTube embed shows branding overlays on hover:
- **Top bar**: Channel icon, video title, "Copy link" button
- **Bottom-right**: YouTube logo

The current 60px top overlay partially blocks the top bar, but the YouTube logo in the bottom-right and the "Copy link" button on the top-right are still accessible.

## Solution

Add additional overlay divs to block the bottom-right YouTube logo and ensure the top-right "Copy link" is fully covered. The overlays will be transparent click-blockers that prevent interaction with YouTube's branding elements while keeping the video controls (play, volume, progress bar, fullscreen) fully functional.

### Changes to `VideoPlayerIframe.tsx`:

1. **Expand existing top overlay** to fully cover the title bar including the "Copy link" on the right
2. **Add bottom-right overlay** to block the YouTube logo (positioned to avoid covering the progress bar and playback controls)

The overlays use `pointer-events-auto` to intercept clicks and `z-10` to sit above the iframe, with near-transparent backgrounds so they're invisible to the user.

### Files to modify:
- `src/components/video/components/VideoPlayerIframe.tsx` — add a bottom-right corner overlay blocking the YouTube logo

