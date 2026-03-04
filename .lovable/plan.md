

# Complete Admin Dashboard Redesign - Implementation Plan

## Current State Summary

The admin dashboard currently suffers from:
- **Messy layout**: Tabs-based navigation cramming too many sections into single tabs (Content tab has 7 sub-sections stacked vertically)
- **Duplicated functionality**: Two separate Dashboard pages (`src/pages/Dashboard.tsx` and `src/pages/admin/Dashboard.tsx`), duplicate admin status checks everywhere
- **Inconsistent design**: Mix of card styles, spacing, and color schemes across sections
- **Missing features**: No analytics tab in sidebar, no testimonials management, no SEO management, no layout customization in sidebar
- **Dead routes**: 13 separate `/admin/*` route pages that overlap with the tabbed dashboard
- **Security concerns**: Admin status checked via `localStorage` PIN bypass and `profiles.is_admin` column instead of `user_roles` table consistently

---

## What the New Admin Dashboard Will Include

### Layout Structure
- **Fixed left sidebar** (collapsible to icon-only mode) with all navigation sections
- **Top header bar** with admin name/avatar, search, and notification bell
- **Main content area** with clean white card containers
- Each section loads as its own page via sidebar navigation (no nested tabs within tabs)

### Sidebar Navigation Sections (10 pages)

1. **Overview / Home** - KPI stat cards (total videos, users, channels, comments), API quota status, recent activity feed, AI filtering summary, quick action buttons, video fetch trigger
2. **Content Moderation (AI Filtering)** - Video moderation queue with approve/reject, search, filter by status, detailed analysis dialog with thumbnail/frame analysis
3. **Videos & Channels** - YouTube channels list (add/delete/restore), video table with search and category filter, deleted items restore
4. **Music Artists** - Artist management table, add/remove artists
5. **Users** - Admin/regular user tables, search, toggle admin status, add admin by email
6. **Categories** - Channel category management (bulk + individual), video category management, custom categories CRUD
7. **Comments** - Real-time comments table with moderation, delete capability
8. **Contact Requests** - Contact form submissions with status management, reply via email
9. **Notifications** - Global notifications CRUD (create/edit/delete site-wide banners), channel request approvals
10. **Analytics** - Google Analytics overview, traffic sources chart, device breakdown, top pages, user activity stats

### Design System
- Clean, modern dashboard aesthetic (light gray background, white content cards, subtle shadows)
- Consistent spacing, typography, and color palette throughout
- Sidebar: dark theme (gray-900) with gradient active state, icon + label, collapsible
- Stat cards: consistent border-left accent color, icon, value, trend indicator
- Tables: consistent header styling, hover states, pagination where needed
- Status badges: unified color scheme (green=approved, red=rejected, yellow=pending, orange=review)
- All buttons: consistent sizing and variant usage
- Responsive: sidebar collapses on smaller screens, content reflows

---

## Technical Implementation Plan

### Phase 1: Delete old admin dashboard files
Remove all existing admin dashboard components and pages to start fresh:
- `src/pages/admin/Dashboard.tsx` (main admin page - rebuild)
- `src/components/admin/dashboard/*` (all tab components, sidebar)
- `src/components/dashboard/AdminDashboardCards.tsx`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/pages/Dashboard.tsx` (old dashboard page)
- All 13 individual `/admin/*` route pages (they will be consolidated into the single dashboard with sidebar navigation)

### Phase 2: Build new admin layout shell
- New `src/pages/admin/Dashboard.tsx` - Main layout with sidebar + header + content area
- New `src/components/admin/AdminSidebar.tsx` - Collapsible sidebar with 10 navigation items
- New `src/components/admin/AdminHeader.tsx` - Top bar with profile info, notifications bell, search
- URL-driven navigation using `?tab=` query params

### Phase 3: Build each section page (reusing existing hooks/logic)
Create new clean components for each section, keeping existing data-fetching hooks and mutations but building fresh UI:

1. **OverviewPage** - Rebuild with organized grid layout, reuse `useDashboardStats`, `ApiQuotaStatus` logic, `VideoFetchButton` logic
2. **ContentModerationPage** - Rebuild using existing `useVideoModeration` hook and approve/reject mutations
3. **VideosChannelsPage** - Rebuild using existing `ChannelsContainer` logic and `RestoreDeletedItems` logic
4. **MusicPage** - Rebuild using existing `useMusicArtists` hook
5. **UsersPage** - Rebuild using existing `useUserManagement` hook
6. **CategoriesPage** - Rebuild using existing `useChannelCategoryManagement` hook
7. **CommentsPage** - Rebuild using existing `CommentsProvider`/`CommentsContext`
8. **ContactRequestsPage** - Rebuild using existing contact requests query logic
9. **NotificationsPage** - Rebuild combining `GlobalNotificationsSection` + `ChannelRequestsSection` logic
10. **AnalyticsPage** - Rebuild using existing Google Analytics components and `useAnalyticsData`

### Phase 4: Clean up routes
- Consolidate all `/admin/*` routes into a single `/admin` route
- The sidebar handles internal navigation via `?tab=` query params
- Remove dead route imports from `App.tsx`

### Phase 5: Verify all functions work
- Video fetch button triggers edge function correctly
- Approve/reject video moderation works
- User admin toggle works
- Channel add/delete/restore works
- Contact request reply sends email
- Global notification CRUD works
- Channel request approve/reject works
- Music artist add/remove works
- Category bulk/individual updates work
- Analytics data loads correctly

---

## Existing Hooks & Logic to Preserve (not rewrite)
- `useDashboardStats` - stats fetching
- `useVideoModeration` - moderation queue
- `useUserManagement` - user table management
- `useChannelCategoryManagement` - category management
- `useMusicArtists` - artist management
- `useAnalyticsData` - analytics data
- `useSessionManager` - auth session
- `useSecureAdminAuth` - PIN auth
- All Supabase RPC calls (`admin_delete_video`, `admin_restore_video`, etc.)
- All edge function invocations (`fetch-youtube-videos`, `send-contact-notifications`, etc.)

## Files to Create (~15 new files)
- `src/pages/admin/Dashboard.tsx` (rebuilt)
- `src/components/admin/layout/AdminLayout.tsx`
- `src/components/admin/layout/AdminSidebar.tsx`
- `src/components/admin/layout/AdminHeader.tsx`
- `src/components/admin/pages/OverviewPage.tsx`
- `src/components/admin/pages/ContentModerationPage.tsx`
- `src/components/admin/pages/VideosChannelsPage.tsx`
- `src/components/admin/pages/MusicPage.tsx`
- `src/components/admin/pages/UsersPage.tsx`
- `src/components/admin/pages/CategoriesPage.tsx`
- `src/components/admin/pages/CommentsPage.tsx`
- `src/components/admin/pages/ContactRequestsPage.tsx`
- `src/components/admin/pages/NotificationsPage.tsx`
- `src/components/admin/pages/AnalyticsPage.tsx`
- `src/components/admin/shared/StatCard.tsx` (reusable)

## Important Notes
- This is a large rebuild (~15+ files to create, ~20+ files to delete/modify)
- Will need to be done in multiple implementation passes
- All existing database queries, mutations, and edge function calls will be preserved
- Only the UI layer is being rebuilt; no database changes needed
- The admin PIN authentication flow will be preserved

