

## Analysis

You already have **Resend** integrated with a free tier that provides **3,000 emails/month at no cost**. Your existing edge functions (`send-welcome-email`, `send-contact-notifications`, `send-video-notifications`) already use Resend successfully. This is the best free option available.

The missing piece is a **broadcast email** feature for admins. Here's what needs to be built:

## Plan

### 1. Create `broadcast_emails` database table
Store broadcast email history (subject, body, sent_by, recipient_count, status, created_at). Migration with RLS allowing only admins to insert/view.

### 2. Create `send-broadcast-email` edge function
- Accepts subject, HTML body, and optional filter (all users, subscribed only)
- Queries all user emails from `profiles` table (respecting `email_preferences.general_emails` opt-in)
- Sends via Resend in batches of 50 (to stay within rate limits)
- Includes unsubscribe link in every email
- Validates caller is admin using `has_role` RPC
- Logs the broadcast to `broadcast_emails` table

### 3. Add Broadcast Email UI in admin dashboard
- New "Broadcast" tab in the Contact Requests page (alongside existing "Contact Requests" and "Email Settings" tabs)
- Form with: subject input, rich-text/HTML message textarea, recipient filter dropdown (All Users / Subscribed Only)
- Preview section before sending
- Send button with confirmation dialog (showing recipient count)
- History table showing past broadcasts

### 4. Important notes
- **Free tier limit**: Resend free tier = 3,000 emails/month, 100/day. The UI will show these limits and warn before exceeding them.
- All emails will use `from: "YidVid <onboarding@resend.dev>"` (Resend's free shared domain — no custom domain cost)
- Every broadcast email includes an unsubscribe footer linking to `/email-preferences`

### Files to create/modify
- **New migration**: `broadcast_emails` table
- **New edge function**: `supabase/functions/send-broadcast-email/index.ts`
- **New component**: `src/components/admin/BroadcastEmailSection.tsx`
- **Modified**: `src/components/admin/pages/ContactRequestsPage.tsx` (add Broadcast tab)

