# Roadmap

- [ ] Audit all accessible user-facing phone routes and overlays in light/dark at the seven requested sizes; fix observed mobile-only defects, recheck changed screens and final build. No authentication, real submissions, backend/admin changes or publication.
- [x] Complete focused preview hypothesis checks: Settings keyboard focus, About/legal buttons and dialogs, video framing, Shorts overlap; confirmed frontend-only fixes and final build verified. No backend/admin access or publication.
- [ ] Verify avatar removal without hover and other signed-in states — blocked by unavailable authenticated preview session (external unmanaged sign-in).
- [x] Backend: daily full-library YouTube viewCount refresh (50 IDs/call), resumable chunked job with durable progress + lock, bulk updates, separate stats sync timestamp, missing-ID recording, bounded retries, quota stop, repair quota-recording function (primary/backup attempts, Pacific midnight reset), replace old view-count schedule only, UI shows YouTube count, trigger one initial full run and verify.
