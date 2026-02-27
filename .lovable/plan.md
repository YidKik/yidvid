
# Color System Overhaul: Sharp, Consistent, Friendly

## The Problem

Colors across the site are inconsistent. Red and yellow appear in many different shades, opacities, and faded variations (`bg-red-50`, `bg-red-50/50`, `rgba(255, 0, 0, 0.08)`, `bg-yellow-50`, `bg-yellow-100/40`, `hover:bg-yellow-50/80`, etc.). This creates a messy, unfocused visual identity. The goal: use **one sharp red**, **one sharp yellow**, and **neutral grays** at **100% opacity** everywhere (except the homepage hero which has its own green theme with existing fades).

---

## The Color Palette (Final)

| Token | Value | Usage |
|---|---|---|
| **Brand Red** | `#FF0000` (hsl 0, 100%, 50%) | Primary actions, active states, CTA buttons, icons needing attention |
| **Brand Yellow** | `#FFCC00` (hsl 50, 100%, 50%) | Accent highlights, hover borders, secondary actions, badges |
| **White** | `#FFFFFF` | Page backgrounds, card backgrounds, input backgrounds |
| **Dark Text** | `#1A1A1A` | Headings, primary text |
| **Medium Text** | `#666666` | Body text, descriptions |
| **Light Text** | `#999999` | Placeholder text, timestamps, view counts |
| **Light Gray BG** | `#F5F5F5` | Section backgrounds, empty states, content area backgrounds |
| **Border Gray** | `#E5E5E5` | All borders, dividers, separators |
| **Hover Gray** | `#F0F0F0` | Hover state for neutral items (sidebar, dropdown items) |

**No new colors needed.** The gray scale provides all the contrast and separation between sections without introducing more hues.

---

## Rules

1. Red and yellow are always at **100% opacity** -- no `bg-red-50`, no `rgba(255,0,0,0.08)`, no `/50` modifiers
2. Red is for **action** (buttons, active states, links). Yellow is for **accent** (borders on hover, secondary buttons, highlights)
3. Backgrounds that need to feel "softer" use **light gray (#F5F5F5)** instead of faded red/yellow
4. The homepage hero section keeps its existing green theme with its current fades (those are a separate design system)
5. Text is always visible against its background (dark text on light bg, white text on red/yellow bg depending on contrast)

---

## Component-by-Component Specification

### 1. Sidebar (`Sidebar.tsx`)

| Element | Current | New |
|---|---|---|
| **Active nav item** bg | `bg-red-50/50` + `border-red-400` | `bg-white` + `border-l-[3px] border-red-500` (left accent bar, no bg tint) |
| **Active nav item** text/icon | `text-red-500` | `text-red-500` (keep) |
| **Hover nav item** | `hover:bg-gray-50` | `hover:bg-[#F0F0F0]` (keep similar) |
| **Category active** | `bg-red-50 border-red-300` | `bg-white border-l-[3px] border-red-500 text-red-500` |
| **Category hover** | `hover:bg-yellow-50 hover:text-yellow-700` | `hover:bg-[#F0F0F0] hover:text-[#1A1A1A]` |
| **Category emoji (inactive)** | `grayscale opacity-70` | `opacity-60` (no grayscale, just dim) |
| **Subscription hover** | `hover:bg-yellow-50 hover:text-yellow-700` | `hover:bg-[#F0F0F0] hover:text-[#1A1A1A]` |
| **Borders/dividers** | `border-gray-100` | `border-[#E5E5E5]` |

### 2. Top Header (`GlobalHeader.tsx`)

| Element | Current | New |
|---|---|---|
| **Background** | `bg-white/95 backdrop-blur` | `bg-white` (solid, no transparency) |
| **Search border** | `border-gray-400` / focused `border-gray-500` | `border-[#E5E5E5]` / focused `border-[#FFCC00]` (yellow focus ring) |
| **Search submit bg** | `#f8f8f8` | `#F5F5F5` |
| **Sign In button** | `hsl(0, 70%, 55%)` | `#FF0000` (brand red, 100%) |
| **Profile circle** | `hsl(0, 70%, 55%)` | `#FF0000` |
| **Search spinner** | `border-red-500` | `border-[#FF0000]` |
| **Homepage floating icon** | `hsl(0, 70%, 55%)` | `#FF0000` |

### 3. Footer (`Footer.tsx`)

| Element | Current | New |
|---|---|---|
| **Background** | `hsl(50, 100%, 96%)` (faded yellow) | `#F5F5F5` (neutral light gray) |
| **Border** | `hsl(50, 80%, 85%)` | `#E5E5E5` |
| **Link text** | `hsl(0, 0%, 45%)` | `#666666` |
| **Link hover** | `hover:text-red-500` | `hover:text-[#FF0000]` |
| **Tagline text** | `hsl(0, 0%, 30%)` | `#666666` |

### 4. Auth Dialog (`Auth.tsx`, `AuthOptions.tsx`, `AuthHeader.tsx`, `AuthForm.tsx`, `AuthTermsFooter.tsx`)

| Element | Current | New |
|---|---|---|
| **Dialog border** | `border-yellow-200` | `border-[#FFCC00]` (full yellow, sharp) |
| **Sign In button** | `bg-red-500 hover:bg-red-600` | `bg-[#FF0000] hover:brightness-90` |
| **Sign Up button** | `bg-yellow-50 border-yellow-400` | `bg-white border-2 border-[#FFCC00] hover:bg-[#FFCC00] hover:text-[#1A1A1A]` |
| **Auth header bg** | `bg-yellow-50` | `bg-[#F5F5F5]` |
| **Auth header border** | `border-yellow-200` | `border-[#E5E5E5]` |
| **Top accent bar** | `bg-yellow-400` | `bg-[#FFCC00]` (keep, already sharp) |
| **Back button hover** | `hover:bg-yellow-100 border-yellow-300` | `hover:bg-[#F0F0F0] border-[#E5E5E5]` |
| **Terms links** | `text-red-500 hover:text-red-600` | `text-[#FF0000] hover:underline` |

### 5. Video Cards (`VideoCardWithOptions.tsx`)

| Element | Current | New |
|---|---|---|
| **Hover border** | `border-yellow-400` | `border-[#FFCC00]` (already correct, keep) |
| **Duration badge** | `bg-black/70` | `bg-[#1A1A1A]` (solid dark, 100%) |
| **Channel fallback avatar** | `from-yellow-400 to-red-500` gradient | `bg-[#FF0000]` (solid red) |
| **Title hover** | via CSS `var(--button-custom)` | `hover:text-[#FF0000]` |

### 6. Video Options Menu (`VideoOptionsMenu.tsx`)

| Element | Current | New |
|---|---|---|
| **3-dot button (overlay)** | `bg-black/60 hover:bg-yellow-400` | `bg-[#1A1A1A] hover:bg-[#FFCC00] hover:text-[#1A1A1A]` |
| **Favorite icon active** | `fill-red-500 text-red-500` | `fill-[#FF0000] text-[#FF0000]` |
| **Create & Add button** | `bg-red-500 hover:bg-red-600` | `bg-[#FF0000] hover:brightness-90` |
| **Dropdown hover** | `hover:bg-gray-100` | `hover:bg-[#F0F0F0]` |

### 7. Landing Page (`LandingPage.tsx`)

| Element | Current | New |
|---|---|---|
| **Features section bg** | `bg-primary/5` | `bg-[#F5F5F5]` |
| **Feature card bg** | `rgba(255, 0, 0, 0.08)` | `bg-white` |
| **Feature card border** | `hsl(0, 100%, 50%)` | `border-[#FF0000]` (keep sharp) |
| **Feature icon bg** | `rgba(255, 0, 0, 0.15)` | `bg-[#F5F5F5]` |
| **Feature icon color** | `hsl(0, 100%, 50%)` | `#FF0000` (keep) |
| **Category buttons bg** | gradient with `rgba` fades | `bg-white border border-[#E5E5E5]` |
| **Category hover overlay** | `rgba(255,0,0,0.08)` gradient | `bg-[#F5F5F5]` |
| **Category icon bg** | `rgba(255,0,0,0.08)` | `bg-[#F5F5F5]` |
| **Browse All Videos btn** | red gradient with shadow | `bg-[#FF0000] text-white` (solid, no gradient) |
| **View All Channels btn** | white gradient | `bg-white border border-[#E5E5E5]` |
| **Red accent text** | `hsl(0, 100%, 50%)` | `#FF0000` (keep) |

### 8. Hero Search (`HeroSearchSection.tsx`)

| Element | Current | New |
|---|---|---|
| **Background blobs** | `hsl(0, 100%, 50%)` at `opacity-20` | Remove or keep very subtle (this is the homepage exception) |
| **Search border** | `rgba(255, 0, 0, 0.3)` | `border-[#E5E5E5]` / focus: `border-[#FFCC00]` |
| **Search button** | `hsl(0, 100%, 50%)` | `#FF0000` |
| **Cursor blink** | `hsl(0, 100%, 50%)` | `#FF0000` |
| **Browse All Videos btn** | white with subtle shadow | keep as-is (neutral, works well) |

### 9. Settings Page (`Settings.tsx`)

| Element | Current | New |
|---|---|---|
| **Header border** | `border-yellow-400` | `border-[#FFCC00]` (already sharp) |
| **Settings icon bg** | `bg-yellow-400` | `bg-[#FFCC00]` |
| **Active tab** | `bg-red-500 text-white` | `bg-[#FF0000] text-white` |
| **Inactive tab hover** | `hover:bg-yellow-100` | `hover:bg-[#F0F0F0]` |
| **Content area** | `bg-gray-50 border-gray-200` | `bg-[#F5F5F5] border-[#E5E5E5]` |

### 10. Favorites Page (`Favorites.tsx`)

| Element | Current | New |
|---|---|---|
| **Empty state icon bg** | `bg-red-50` | `bg-[#F5F5F5]` |
| **Header icon bg** | `bg-red-500` | `bg-[#FF0000]` |
| **Sign In button** | `bg-red-500 hover:bg-red-600` | `bg-[#FF0000] hover:brightness-90` |
| **Browse Videos button** | `bg-yellow-400 hover:bg-yellow-500` | `bg-[#FFCC00] hover:brightness-90 text-[#1A1A1A]` |
| **Play overlay circle** | `bg-yellow-400` | `bg-[#FFCC00]` |
| **Favorite badge** | `bg-red-500` | `bg-[#FF0000]` |
| **Title hover** | `hover:text-red-500` | `hover:text-[#FF0000]` |

### 11. Watch Later Page (`WatchLater.tsx`)

| Element | Current | New |
|---|---|---|
| **Empty icon bg** | `bg-yellow-50` | `bg-[#F5F5F5]` |
| **Header icon bg** | `bg-yellow-400` | `bg-[#FFCC00]` |
| **Sign In button** | `bg-red-500 hover:bg-red-600` | `bg-[#FF0000] hover:brightness-90` |
| **Play overlay** | `bg-yellow-400` | `bg-[#FFCC00]` |
| **Watch Later badge** | `bg-yellow-400` | `bg-[#FFCC00]` |
| **Title hover** | `hover:text-yellow-600` | `hover:text-[#FFCC00]` |

### 12. Video Detail Page (Action Bar + Channel Section)

| Element | Current | New |
|---|---|---|
| **Like active** | `bg-red-50 text-red-500` | `bg-[#F5F5F5] text-[#FF0000]` |
| **Share/Report hover** | `hover:bg-yellow-100 hover:text-yellow-700 hover:border-yellow-400` | `hover:bg-[#F5F5F5] hover:text-[#1A1A1A] hover:border-[#FFCC00]` |
| **Share dialog hover** | `hover:bg-yellow-50 hover:border-yellow-300` | `hover:bg-[#F0F0F0] hover:border-[#FFCC00]` |
| **Native share button** | `bg-yellow-100 hover:bg-yellow-200 text-yellow-700` | `bg-[#FFCC00] text-[#1A1A1A] hover:brightness-90` |
| **Subscribe button** | `bg-red-500 hover:bg-red-600` | `bg-[#FF0000] hover:brightness-90` |
| **Channel section border** | `border-yellow-200/30` | `border-[#E5E5E5]` |
| **Channel section gradients** | `from-yellow-50/20`, `from-yellow-100/40 via-red-50/20` | `bg-[#F5F5F5]` (solid, no gradients) |
| **Description accent bar** | `from-yellow-400 to-red-400` gradient | `bg-[#FFCC00]` (solid yellow) |
| **Channel video hover border** | `hover:border-yellow-400` | `hover:border-[#FFCC00]` |
| **Show more button** | `text-yellow-600 hover:bg-yellow-100/50` | `text-[#FFCC00] hover:bg-[#F0F0F0]` |

### 13. About Page (`About.tsx`)

| Element | Current | New |
|---|---|---|
| **Feature icon color** | `hsl(50, 100%, 45%)` | `#FFCC00` |
| **Feature card bg** | `bg-gray-50 border-gray-100` | `bg-[#F5F5F5] border-[#E5E5E5]` |
| **Mission section bg** | `hsl(50, 100%, 95%)` | `bg-[#F5F5F5]` |
| **Title color** | `hsl(180, 100%, 13%)` | `#1A1A1A` |

### 14. Search Page (`Search.tsx`)

| Element | Current | New |
|---|---|---|
| **Page bg** | `bg-gradient-to-br from-background to-secondary/20` | `bg-white` |
| **Content card** | `bg-white/80 backdrop-blur-sm border-primary/10` | `bg-white border-[#E5E5E5]` |
| **Section header count badge** | `bg-primary/10 text-primary` | `bg-[#F5F5F5] text-[#FF0000]` |
| **Channel hover** | `hover:bg-primary/5 hover:border-primary/20` | `hover:bg-[#F0F0F0] hover:border-[#E5E5E5]` |

### 15. CSS Overrides (`buttons.css`, `links.css`, `colors.css`, `navigation.css`)

**Critical: Remove the global `!important` button override in `buttons.css`** that forces all buttons to use `var(--button-custom)`. This is the root cause of many color conflicts. Instead, buttons should get their color from their React component classes.

- `buttons.css`: Remove the blanket `button:not([class*="home-"])` rule that forces bg color
- `links.css`: Keep the hover color rule but change to `#FF0000`
- `colors.css`: Simplify - remove all the `:not(.home-page)` overrides since we'll use direct classes
- `navigation.css`: Keep homepage-specific rules, clean up the `!important` chains

### 16. Theme Variables (`theme.css`)

Update CSS variables to match the new palette:
- `--primary: 0 100% 50%` (keep, this is `#FF0000`)
- `--highlight: 50 100% 50%` -- change to `50 100% 40%` for `#FFCC00`
- Remove `--button-custom`, `--background-custom`, `--text-custom` variables from the default (keep them only for user customization in ColorContext)

### 17. Notification Bell (`NotificationBell.tsx`)

| Element | Current | New |
|---|---|---|
| **Bell button border** | `border-red-400` | `border-[#FF0000]` |
| **Bell button hover** | `hover:bg-red-50` | `hover:bg-[#F0F0F0]` |
| **Bell icon** | `text-red-500` | `text-[#FF0000]` |

### 18. Channels Grid (`ChannelsGrid.tsx`)

| Element | Current | New |
|---|---|---|
| **Request Channel btn** | `border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:shadow-yellow-200/40` | `border-[#FFCC00] text-[#1A1A1A] hover:bg-[#FFCC00] hover:text-[#1A1A1A]` |

### 19. Scroll-to-Top Button (`Videos.tsx`)

| Element | Current | New |
|---|---|---|
| **Border/stroke** | `hsl(50, 100%, 50%)` | `#FFCC00` (already correct) |

---

## Implementation Order

1. **CSS cleanup** -- Remove global `!important` overrides in `buttons.css`, `navigation.css`, `colors.css` that conflict with component styles
2. **Theme variables** -- Update `theme.css` with clean values
3. **Sidebar** -- Update active/hover states
4. **Header + Footer** -- Solid backgrounds, sharp colors
5. **Auth dialogs** -- Sharp borders, solid backgrounds
6. **Landing page + Hero** -- Remove rgba fades, use solid colors
7. **Video cards + Options menu** -- Consistent hover/active states
8. **Library pages** (Favorites, Watch Later, Playlists) -- Matching pattern
9. **Video detail page** -- Action bar, channel section cleanup
10. **Settings, About, Search, Dashboard** -- Final sweep
11. **Notification components** -- Match new palette

This will touch approximately 20-25 files but each change is straightforward: replacing faded/opacity colors with their solid equivalents from the palette above.
