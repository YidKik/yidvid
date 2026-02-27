
# Fix Mobile/Tablet Videos Page -- Use Desktop Sections with Responsive Layouts

## Problem

The mobile Videos page currently renders a completely different component (`MobileVideoView`) that strips away most features the desktop has. It shows only 2 videos per section in horizontal scroll carousels, no Featured section, no "View All" expansion with pagination, and only 3 channels with no expand option. This is why it "doesn't look good" and is "missing all functions."

## Solution

Stop using the separate `MobileVideoView` entirely. Instead, make `DesktopVideoView` and all its child sections (Featured, Latest, Trending, Channels) responsive so they adapt their layout for mobile and tablet while keeping all functionality.

---

## Step 1: Route all devices through DesktopVideoView

**File**: `src/components/content/VideoContentDisplay.tsx`

Remove the `isMobile` conditional that switches between `MobileVideoView` and `DesktopVideoView`. Always render `DesktopVideoView` for all screen sizes so mobile/tablet gets the same sections, buttons, and features as desktop.

## Step 2: Make DesktopVideoView responsive

**File**: `src/components/content/DesktopVideoView.tsx`

- Reduce horizontal padding on mobile: `px-3` instead of `px-8`, `px-4` for tablet
- Reduce spacing between sections: `space-y-4` on mobile instead of `space-y-6`

## Step 3: Make FeaturedVideoSection responsive

**File**: `src/components/videos/FeaturedVideoSection.tsx`

- Currently each card is `w-[calc(33.333%-14px)]` (3 cards per row)
- On mobile: 1 card visible at a time, full width (`w-full`)
- On tablet: 2 cards visible (`w-[calc(50%-10px)]`)
- Reduce overlay text sizes on mobile (`text-sm` instead of `text-base`)
- Reduce padding inside cards on mobile
- Smaller play button on mobile (w-12 h-12 instead of w-16 h-16)

## Step 4: Make NewVideosSection responsive

**File**: `src/components/videos/NewVideosSection.tsx`

- Carousel view: cards currently `w-[calc(20%-13px)]` (5 per row)
  - Mobile: `w-[calc(50%-8px)]` (2 visible at a time)
  - Tablet: `w-[calc(33.333%-10px)]` (3 visible)
- Expanded grid: already uses `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` -- this is fine
- Pagination buttons: reduce padding on mobile (`px-4 py-2` instead of `px-8 py-3`)
- "View all" button and Back button: smaller text on mobile
- Section title: same responsive sizing
- Section padding: reduce `-mx-6 px-6` to `-mx-3 px-3` on mobile

## Step 5: Make TrendingSection responsive

**File**: `src/components/videos/TrendingSection.tsx`

Same changes as NewVideosSection:
- Carousel card widths: 2 visible on mobile, 3 on tablet, 5 on desktop
- Pagination buttons: smaller on mobile
- Section padding: less on mobile

## Step 6: Make ChannelsRowSection responsive

**File**: `src/components/videos/ChannelsRowSection.tsx`

- Channel cards currently `w-[210px]` with `w-28 h-28` avatars
  - Mobile: `w-[140px]` cards, `w-16 h-16` avatars, reduced padding
  - Tablet: `w-[170px]` cards, `w-20 h-20` avatars
- Expanded grid: already has responsive cols -- verify it works
- "View All Channels" button: smaller on mobile
- Section padding: less on mobile
- Skeleton loader: fewer cards on mobile (3 instead of 6)

## Step 7: Make Videos.tsx page wrapper responsive

**File**: `src/pages/Videos.tsx`

- The main content padding `px-6 lg:px-8` is fine but confirm `sidebarWidth` is 0 on mobile (already done in SidebarContext)
- Ensure `pb-20` for bottom nav clearance on mobile

---

## Technical Details

All changes use the `useIsMobile()` hook already available, which returns `{ isMobile, isTablet, isDesktop }`. Each section component will import it and conditionally apply different Tailwind classes or inline widths.

### What stays the same
- Desktop layout is completely untouched (all responsive changes are additive)
- All functionality: View All expansion, pagination, channel grid, featured carousel
- Brand colors and design language
- Bottom nav and header (already responsive from previous work)

### Files modified
1. `src/components/content/VideoContentDisplay.tsx` -- Remove MobileVideoView branch
2. `src/components/content/DesktopVideoView.tsx` -- Add responsive padding
3. `src/components/videos/FeaturedVideoSection.tsx` -- Responsive card widths
4. `src/components/videos/NewVideosSection.tsx` -- Responsive carousel + grid
5. `src/components/videos/TrendingSection.tsx` -- Responsive carousel + grid
6. `src/components/videos/ChannelsRowSection.tsx` -- Responsive channel cards
7. `src/pages/Videos.tsx` -- Minor padding adjustments

### Files NOT modified (no changes needed)
- `MobileVideoView.tsx` -- kept but unused (can be removed later)
- `MobileVideoCarouselSection.tsx` -- kept but unused
- `MobileChannelsRow.tsx` -- kept but unused
- All other pages, header, bottom nav, sidebar
