

## Plan: Simplify Channel Page Loading States

### Problem
The channel details page shows verbose messages like "No videos found for this channel", "Error loading videos", "Refresh Videos" buttons, and `VideoPlaceholder` blocks while videos are loading. These appear prematurely and look bad.

### Changes

**1. `src/components/channel/ChannelVideoSection.tsx`**
- Remove the error state block (with "Error loading videos" heading, error message, VideoPlaceholder, and Retry button). Replace with just the simple Loader2 spinner — treat errors as "still loading" silently.
- Remove the "No videos found" block (with VideoPlaceholder, heading, description, and Refresh button). Replace with just the Loader2 spinner if loading, or show nothing/minimal empty state if truly done loading.
- Remove the `VideoPlaceholder` and `Button` imports.

**2. `src/components/channel/ChannelVideos.tsx`**
- Remove the "No videos found for this channel" text message block (lines 35-41). If no videos and not loading, just render nothing (empty div).

**3. `src/hooks/channel/useChannelVideos.ts`**
- Reduce `staleTime` from 5 minutes to 2 minutes for fresher data.
- Use `keepPreviousData`/`placeholderData` so cached results show immediately on revisit, avoiding the loading state entirely when data exists.

### Result
While videos load, users see only a single subtle spinner. No text messages, no placeholder blocks, no retry buttons. Videos appear as soon as they're ready.

