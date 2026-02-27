

# Mobile and Tablet Text, Sizing, and Layout Polish -- Full Site Audit

## Problem

While the structural responsive layout (sidebar removal, bottom nav, sidebar offset fixes) is in place, the actual content inside each page still renders with desktop-sized text, oversized buttons, misaligned metadata, and inconsistent spacing on mobile and tablet. The video details page is the worst offender: action buttons (Like, Dislike, Share, Favorite, Watch Later, Playlist) are too large and wrap into two rows; the views/date metadata uses a pill-badge style that takes up too much space; and on tablet the comments sidebar takes up half the screen width.

## Solution

Go through every page and component, adding mobile/tablet-specific sizing using the existing `useIsMobile()` hook. This is purely a styling pass -- no functionality changes, no desktop changes.

---

## Step 1: Fix FriendlyVideoActionBar (compact mode for mobile)

**File**: `src/components/video/details/FriendlyVideoActionBar.tsx`

The compact mode (used on mobile) currently renders buttons at `h-8 px-3` with full text labels like "Like", "Favorite", "Watch Later", "Playlist" which causes wrapping to two rows on small screens.

Changes:
- Make compact buttons icon-only (remove text labels) with `h-7 w-7 p-0` circular style -- fits all 7 buttons in one row
- Reduce icon size from `h-4 w-4` to `h-3.5 w-3.5` in compact mode
- Shrink the meta info pills (views/date): smaller padding (`px-2 py-0.5`), smaller text (`text-xs`), smaller icons (`h-3 w-3`)
- Remove the gap between the meta row and action row: reduce `space-y-3` to `space-y-2`

**File**: `src/components/video/details/FriendlyVideoActionBar.tsx` (non-compact / tablet)

The non-compact mode is used for both desktop and tablet. On tablet, buttons also wrap.

Changes:
- Import `useIsMobile` and detect `isTablet`
- When `isTablet`: reduce button height to `h-8`, reduce padding to `px-3`, use `text-xs`
- When `isTablet`: shrink meta info pills similarly to compact mode

## Step 2: Fix VideoDetails tablet layout

**File**: `src/pages/VideoDetails.tsx`

Currently tablet uses the `!isMobile` branch (lines 105-182), which renders a side-by-side layout with a 380px fixed-width comments column. On a 768px tablet, this leaves barely 350px for the video.

Changes:
- Add a tablet-specific condition: when `isTablet`, use the stacked mobile layout (video on top, content below, comments below) instead of the side-by-side desktop layout
- Change the `!isMobile` check on line 105 to `isDesktop` (only desktop gets the two-column layout)
- Tablet and mobile both get the stacked layout
- On tablet stacked layout: use slightly larger text than mobile (`text-lg` title instead of mobile `text-base`, `text-xl` for desktop)
- Reduce mobile video title from `text-lg` to `text-base`
- Reduce mobile section padding from `px-4` to `px-3`
- The `-mx-6` on the mobile video player (line 189) should be `-mx-3` to match the reduced padding

## Step 3: Fix FriendlyChannelSection for mobile/tablet

**File**: `src/components/video/details/FriendlyChannelSection.tsx`

Changes:
- When compact (mobile): reduce avatar from `h-10 w-10` to `h-8 w-8`
- When compact: reduce channel name text from `text-sm` to `text-xs`
- When compact: reduce Subscribe button height from `h-9` to `h-7`, text `text-xs`, padding `px-3`
- When compact: description text from `text-sm` to `text-xs`, padding from `p-4` to `p-3`
- "More from channel" grid: on compact show `grid-cols-2` with smaller gap (`gap-2`)
- "More from" label: `text-xs` on compact

## Step 4: Fix Search page for mobile/tablet

**File**: `src/pages/Search.tsx`

Changes:
- Search header title: `text-lg` on mobile instead of `text-2xl`, `text-xl` on tablet
- Search icon in header: `h-5 w-5` on mobile instead of `h-6 w-6`
- "results found" text: already `text-sm`, fine
- Section headers ("Channels", "Videos"): `text-base` on mobile instead of `text-lg`
- Channel cards: on mobile, reduce avatar from `w-16 h-16` to `w-12 h-12`, padding from `p-4` to `p-3`
- Channel card text: `text-xs` instead of `text-sm` on mobile
- Video grid: already responsive with `grid-cols-1 sm:grid-cols-2`, no change needed
- Import `useIsMobile` hook

## Step 5: Fix Settings page for mobile

**File**: `src/pages/Settings.tsx`

Changes:
- Page title: `text-xl` on mobile instead of `text-2xl`
- Settings icon container: `p-1.5` and `w-4 h-4` icon on mobile
- Navigation tabs: reduce `px-5 py-2.5` to `px-3 py-2` on mobile, `text-xs` instead of `text-sm`
- Make the tabs container horizontally scrollable on mobile: add `overflow-x-auto flex-nowrap` and `scrollbar-hide`

## Step 6: Fix About page for mobile

**File**: `src/pages/About.tsx`

Changes:
- Main heading: already has `text-4xl md:text-5xl`, add mobile override: `text-2xl` for screens under 480px using the hook
- Description: `text-base` on mobile instead of `text-lg`
- Feature cards grid: already `md:grid-cols-2` so 1-col on mobile -- good
- Feature card padding: `p-4` on mobile instead of `p-6`
- Feature card icon: `w-8 h-8` on mobile instead of `w-10 h-10`
- Feature card title: `text-lg` on mobile instead of `text-xl`
- Feature card description: `text-sm` on mobile
- Mission section: `p-5` on mobile instead of `p-8`, heading `text-xl` instead of `text-2xl`
- Action buttons: reduce `px-6 py-3` to `px-4 py-2.5` on mobile, `text-xs`
- Page padding: `px-4 py-8` on mobile instead of `px-6 py-12`

## Step 7: Fix ChannelDetails / ChannelHeader for mobile

**File**: `src/components/channel/ChannelHeader.tsx`

Changes:
- Avatar: already `w-24 h-24 md:w-32 md:h-32`, fine
- Channel name: `text-xl` on mobile instead of `text-2xl`, keep `md:text-3xl lg:text-4xl`
- Subscribe button: `h-9` on mobile instead of `h-10 md:h-11`, `text-xs` on mobile
- Card padding: `p-4` on mobile instead of `p-5 md:p-8`
- Description text: already `text-sm md:text-base`, fine

## Step 8: Fix Playlists page for mobile

**File**: `src/pages/Playlists.tsx`

Changes:
- Playlist detail view: the side-by-side thumbnail (`w-44`) and text layout on playlist items (line 209) should stack on mobile -- thumbnail full width on top, text below
- Import `useIsMobile` hook
- When mobile: playlist items use `flex-col` instead of `flex gap-4`, thumbnail becomes `w-full` aspect-video
- Playlist header icon: `w-12 h-12` on mobile instead of `w-16 h-16`
- Header title: `text-xl` on mobile instead of `text-2xl`
- "New Playlist" button: `px-4 text-xs` on mobile instead of `px-6`
- Playlist card grid: already `grid-cols-1 sm:grid-cols-2` -- fine

## Step 9: Fix GlobalHeader search bar for mobile

**File**: `src/components/layout/GlobalHeader.tsx`

Changes:
- On mobile: reduce search input padding (`py-2` instead of `py-2.5`)
- Search submit button: `h-8 px-3` on mobile instead of `h-10 px-4`
- Search input font: `text-xs` on mobile instead of `text-sm`
- The left spacer `w-10` wastes space on mobile: reduce to `w-4` on mobile

## Step 10: Fix CommentForm for mobile

**File**: `src/components/comments/CommentForm.tsx`

Changes:
- Textarea: reduce `min-h-[120px]` to `min-h-[80px]` on mobile, `text-xs` instead of `text-sm`, `p-3` instead of `p-4`
- Post button: `text-xs px-4` on mobile instead of `text-sm px-5`
- Send icon: `h-3.5 w-3.5` on mobile

## Step 11: Fix VideoComments container for mobile

**File**: `src/components/video/details/VideoComments.tsx`

Changes:
- Comment form wrapper: `p-3` on mobile instead of `p-4`
- "Be the first to comment" empty state icon: `w-10 h-10` on mobile instead of `w-12 h-12`
- Message count text: already `text-sm`, fine

---

## Technical Approach

Every component change uses the same pattern:
1. Import `useIsMobile` from `@/hooks/use-mobile`
2. Destructure `{ isMobile, isTablet }`
3. Use ternary expressions in className strings: `isMobile ? "text-xs" : "text-sm"`
4. Desktop classes remain untouched as the fallback

## Files Modified (14 total)

1. `src/components/video/details/FriendlyVideoActionBar.tsx` -- Shrink buttons and meta pills
2. `src/pages/VideoDetails.tsx` -- Tablet uses stacked layout, smaller mobile text
3. `src/components/video/details/FriendlyChannelSection.tsx` -- Smaller avatar, text, button
4. `src/pages/Search.tsx` -- Smaller headings and channel cards
5. `src/pages/Settings.tsx` -- Smaller tabs, scrollable nav
6. `src/pages/About.tsx` -- Smaller headings, cards, buttons
7. `src/components/channel/ChannelHeader.tsx` -- Smaller text and padding
8. `src/pages/Playlists.tsx` -- Stacked playlist items on mobile
9. `src/components/layout/GlobalHeader.tsx` -- Compact search bar
10. `src/components/comments/CommentForm.tsx` -- Smaller textarea and button
11. `src/components/video/details/VideoComments.tsx` -- Tighter spacing

## What Will NOT Change

- Desktop layout on any page
- Any functionality or features
- Color scheme, fonts, or brand identity
- Bottom navigation or sidebar behavior
- Video player sizing

