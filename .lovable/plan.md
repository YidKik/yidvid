# Thumbnail-based modesty filter

## Why videos with women still show

The filter you have today only reads the video title and description. Every approved video in the database was approved with zero images checked (`frames_analyzed: 0`) — the image-checking part of the old code needs a paid outside service (Sightengine) whose keys were never added, so it silently skipped every thumbnail and approved the video on text alone.

Current library state (videos not deleted):
- 15,152 approved (all text-only approvals)
- 12,721 pending (only 121 ever analyzed)
- 2,436 waiting for manual review
- 8,976 rejected

## What will be built

Replace the image step with Lovable AI vision, which is already available to this project — no outside account, no Sightengine keys.

For every video, the AI looks at the thumbnail image plus the title and channel name and answers one question: does this show a woman or girl, or anything else immodest? It returns a clear verdict plus a short reason.

Result handling:
- Clearly shows a woman/girl or immodest content -> hidden from the site automatically
- Clean -> approved and visible
- Unsure / can't read the image -> sent to your admin review queue, stays hidden until you decide

Nothing changes for visitors except that flagged videos disappear.

## Where it runs

1. **New videos** — every video pulled in from YouTube goes through the check before it can appear.
2. **Existing library** — a re-scan you start from the admin dashboard, running in batches in the background with a progress readout, so you can watch it work and stop it at any time. It re-checks everything, including the videos already marked approved, because those were never image-checked.

## Admin side

In the existing Content Analysis area:
- Start / pause the re-scan, with a live counter (checked, hidden, sent to review)
- A review queue showing the thumbnail, the AI's reason, and Approve / Hide buttons
- Ability to override any AI decision

## Cost

Lovable AI credits only, one small image check per video. It runs once per video, never per page view, so day-to-day traffic costs nothing. The one-time re-scan of the ~39,000 existing videos is the only bulk cost; it is throttled and resumable so you can run it in stages and watch the credit usage.

## Technical notes

- Rewrite `supabase/functions/video-content-analyzer/index.ts` to call the Lovable AI Gateway with the thumbnail URL as image input and a strict JSON verdict schema (`verdict`: allow | block | review, `reasons[]`, `confidence`), dropping the Sightengine path.
- Keep writing to the existing `youtube_videos` columns (`content_analysis_status`, `analysis_details`, `analysis_score`, `analysis_timestamp`) and `content_analysis_logs`, so the current admin screens and the `content_analysis_status = 'approved'` filters in `useVideos`, `useShorts`, `useVideoFetcher`, `useVideoSearch`, and `contentFetching` keep working unchanged.
- Rework `analyze-existing-videos` into a resumable batch worker (cursor by `analysis_timestamp`, small batch size, bounded concurrency) invoked from the admin UI; handle gateway 429/402/403 by pausing the batch rather than retry-looping.
- `fetch-youtube-videos/channel-processor.ts` keeps invoking the analyzer per new video; failures land in `manual_review`, never `approved`.
