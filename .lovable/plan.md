

# Mobile and Tablet Responsive Design -- Complete Overhaul

## Overview

The desktop layout is polished and final -- it will NOT be touched. This plan creates proper mobile (under 480px) and tablet (480px-1024px) responsive layouts for every page, ensuring all buttons, features, and content remain accessible but are repositioned and resized appropriately for smaller screens.

## Current State

- **Breakpoints already defined**: Mobile < 480px, Tablet 480px-1024px, Desktop >= 1024px (in `use-mobile.tsx`)
- **Homepage**: Already has a `MobileHomeSection` component for mobile/tablet -- needs review and polish
- **Videos page**: Has `MobileVideoView` component but the main page still applies `pl-[200px]` sidebar offset on all screens
- **ALL other pages** (Settings, Search, Favorites, Watch Later, History, Playlists, About, VideoDetails, ChannelDetails, ResetPassword): Have **hardcoded `pl-[200px]`** which breaks on mobile/tablet -- content gets pushed off screen
- **Sidebar**: The `layout/Sidebar.tsx` renders on all screen sizes including mobile -- needs to be hidden on mobile/tablet and replaced with a bottom navigation bar or hamburger menu
- **GlobalHeader**: Renders on all screens but the search bar and layout are not optimized for small screens

## Architecture Approach

The strategy is to use the existing `useIsMobile()` hook (which returns `isMobile`, `isTablet`, `isDesktop`) to conditionally render different layouts per device. Desktop code stays untouched.

---

## Step-by-Step Implementation

### Step 1: Hide Desktop Sidebar on Mobile/Tablet, Add Mobile Bottom Navigation

**Files**: `src/App.tsx`, new `src/components/layout/MobileBottomNav.tsx`

- Wrap `<Sidebar>` in a condition: only render when `isDesktop` is true
- Create a new `MobileBottomNav` component -- a fixed bottom bar with 5 icon buttons: Home, Videos, Search, Favorites, Settings (or Menu)
- The bottom nav uses the brand colors: white background, `#FF0000` for active icon, `#666666` for inactive
- Only render `MobileBottomNav` when `isMobile || isTablet`
- Add a hamburger/menu icon that opens a slide-up sheet with the full sidebar menu items (History, Watch Later, Playlists, Categories, Subscriptions, About)

### Step 2: Fix GlobalHeader for Mobile/Tablet

**File**: `src/components/layout/GlobalHeader.tsx`

- When `isMobile || isTablet`: remove the `left: sidebarWidth` offset (set `left: 0`)
- Shrink the search bar padding and font size
- On mobile: collapse search to an icon that expands on tap (similar to existing `MobileVideosHeader` pattern)
- Profile/Sign-In button stays in top-right, notification bell stays
- Keep the homepage floating profile icon behavior as-is

### Step 3: Fix Every Page's `pl-[200px]` Hardcoded Sidebar Offset

Every page below has `pl-[200px]` hardcoded. Each needs a conditional: use `pl-0` on mobile/tablet, keep `pl-[200px]` on desktop. The cleanest approach is to use the `useSidebarContext` hook and set `paddingLeft: 0` when not desktop.

**Pages to update** (remove `pl-[200px]` for mobile/tablet):
- `src/pages/Settings.tsx` (line 29, 40)
- `src/pages/Search.tsx` (line 129, 138)
- `src/pages/Favorites.tsx` (lines 18, 43)
- `src/pages/WatchLater.tsx` (lines 18, 43)
- `src/pages/Playlists.tsx` (lines 85, 112, 285)
- `src/pages/About.tsx` (line 25)
- `src/pages/VideoDetails.tsx` (lines 60, 101)
- `src/pages/ChannelDetails.tsx` (lines 165, 215)
- `src/pages/History.tsx` -- already handled with `sidebarWidth` but needs mobile padding-left of 0

For each page, add `useIsMobile()` and conditionally apply padding:
```
style={{ paddingLeft: isDesktop ? '200px' : '0' }}
```
Or use the existing `sidebarWidth` from context but ensure it returns 0 on mobile/tablet.

### Step 4: Mobile/Tablet Layout for Videos Page

**Files**: `src/pages/Videos.tsx`, `src/components/content/VideoContent.tsx`

- Remove sidebar offset on mobile/tablet (already partially handled)
- Add bottom padding for the mobile bottom nav bar (`pb-20`)
- Video grid: 1 column on mobile, 2 columns on tablet (instead of 3-4)
- Section headers: smaller font size on mobile
- Featured carousel: full-width single card on mobile, 2 cards on tablet

### Step 5: Mobile/Tablet Layout for Video Details Page

**File**: `src/pages/VideoDetails.tsx`

- Mobile layout already exists (lines 186-260) but has `pl-[200px]` on the wrapper -- remove it
- Tablet layout: use the mobile stacked layout but with slightly larger text and spacing
- Add bottom padding for mobile nav bar
- Ensure the video player is full-width edge-to-edge on mobile

### Step 6: Mobile/Tablet Layout for Search Page

**File**: `src/pages/Search.tsx`

- Remove `pl-[200px]` on mobile/tablet
- Video grid: 1 column on mobile, 2 columns on tablet
- Channel cards: 1 column on mobile, 2 on tablet
- Reduce heading sizes: `text-xl` instead of `text-2xl` on mobile
- Add bottom padding for mobile nav

### Step 7: Mobile/Tablet Layout for Settings Page

**File**: `src/pages/Settings.tsx`

- Remove `pl-[200px]` on mobile/tablet
- Navigation tabs: make scrollable horizontally if needed on very small screens
- Reduce padding and font sizes slightly
- Content sections: full width on mobile

### Step 8: Mobile/Tablet Layout for Favorites, Watch Later, Playlists Pages

**Files**: `src/pages/Favorites.tsx`, `src/pages/WatchLater.tsx`, `src/pages/Playlists.tsx`

- Remove `pl-[200px]` on mobile/tablet
- Video grid: 2 columns on mobile, 3 on tablet (instead of 4)
- Header icon: slightly smaller on mobile (w-12 h-12 instead of w-16 h-16)
- Playlist detail items: stack thumbnail above title on mobile instead of side-by-side
- Add bottom padding for mobile nav

### Step 9: Mobile/Tablet Layout for About Page

**File**: `src/pages/About.tsx`

- Remove `pl-[200px]` on mobile/tablet
- Feature grid: 1 column on mobile, 2 on tablet
- Reduce heading from `text-4xl` to `text-2xl` on mobile
- Action buttons: stack vertically on mobile instead of horizontal row

### Step 10: Mobile/Tablet Layout for Channel Details Page

**File**: `src/pages/ChannelDetails.tsx`

- Remove `pl-[200px]` on mobile/tablet
- Channel header: stack vertically on mobile (avatar above name)
- Video grid within channel: 1 column on mobile, 2 on tablet

### Step 11: Add Bottom Padding to All Pages for Mobile Nav Bar

Every page needs `pb-20` (or similar) on mobile/tablet to prevent the fixed bottom navigation from covering content.

### Step 12: Typography and Spacing Adjustments

Across all pages for mobile/tablet:
- Page titles: `text-xl` instead of `text-2xl`
- Body text: `text-sm` instead of default
- Padding: `px-4` instead of `px-6` on mobile
- Gaps between cards: `gap-4` instead of `gap-6` on mobile
- Border radius on cards: slightly smaller on mobile

---

## Technical Details

### Mobile Bottom Navigation Component Structure
```text
+--------------------------------------------------+
|  Home  |  Videos  |  Search  |  Library  |  Menu  |
|  (icon)  (icon)    (icon)     (icon)      (icon)  |
+--------------------------------------------------+
```
- Fixed to bottom, `z-50`, white background, top border `#E5E5E5`
- Active item: `#FF0000` icon + text, inactive: `#666666`
- Library opens a sheet with: History, Favorites, Watch Later, Playlists
- Menu opens a sheet with: Settings, About, Subscriptions, Categories, Sign In/Profile

### SidebarContext Update
Modify `SidebarContext.tsx` so that `sidebarWidth` returns `0` when `isMobile || isTablet`. This way, any page using `sidebarWidth` for padding automatically gets the correct value without individual page changes.

### Files Created (New)
1. `src/components/layout/MobileBottomNav.tsx` -- Bottom navigation bar for mobile/tablet

### Files Modified (Existing)
1. `src/contexts/SidebarContext.tsx` -- Return width 0 on mobile/tablet
2. `src/App.tsx` -- Conditionally render Sidebar/MobileBottomNav
3. `src/components/layout/GlobalHeader.tsx` -- Mobile-responsive header
4. `src/pages/Videos.tsx` -- Mobile grid/spacing
5. `src/pages/VideoDetails.tsx` -- Remove hardcoded pl-[200px]
6. `src/pages/Search.tsx` -- Mobile layout
7. `src/pages/Settings.tsx` -- Mobile layout
8. `src/pages/Favorites.tsx` -- Mobile layout
9. `src/pages/WatchLater.tsx` -- Mobile layout
10. `src/pages/Playlists.tsx` -- Mobile layout
11. `src/pages/About.tsx` -- Mobile layout
12. `src/pages/ChannelDetails.tsx` -- Mobile layout
13. `src/pages/History.tsx` -- Verify mobile works

### What Will NOT Change
- Desktop layout on any page (no visual changes above 1024px)
- Brand colors, fonts, or design language
- Any component's functionality or features
- The MobileHomeSection (homepage mobile) -- already exists and works

