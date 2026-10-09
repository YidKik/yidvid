- Corner radii use role classes `rounded-badge|control|card|dialog|circle` (vars in src/styles/theme.css); never raw rounded-full/2xl/3xl for UI — keeps shape geometry centrally tunable.
- Elevation uses `shadow-raised` (hover cards) and `shadow-overlay` (menus/dialogs/toasts) only — one theme-aware shadow per role.
- Typography uses one stack (`--font-ui`, loaded in index.html) and role classes `type-hero|h1|h2|h3|body|legal|card-title|meta|label|help|caption|footer` in src/index.css; never inline fontFamily or arbitrary letter-spacing — keeps type centrally tunable.
- Form fields render at 16px text on all devices (global rule in src/index.css) — prevents iOS focus zoom.
- Confirmed mobile audit corrections use scoped role selectors under the existing desktop breakpoint in src/styles/mobile-audit.css; preserve desktop geometry and existing interaction handlers.

- Navigation destinations live in src/components/layout/navConfig.ts and feed both the desktop sidebar and the phone/tablet bottom nav; layout offsets use the runtime --sidebar-w var and the .pb-nav utility (--bottomnav-h) — one source for nav entries, active logic and offsets.
- YouTube view counts come only from the daily `sync-video-stats` edge function (resumable cursor + lease in `youtube_stats_sync_runs`, bulk `bulk_apply_video_stats`); site plays never write `views` — keeps counts authoritative and avoids bumping content ordering.
- All YouTube API calls must reserve quota via `reserve_youtube_quota` (one shared pool, Pacific-midnight reset); never fall back to another key on quota exhaustion — keys in one Google project share quota.
