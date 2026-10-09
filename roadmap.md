# Roadmap

- [x] Audit accessible signed-out phone routes and overlays at the seven requested sizes in light/dark; correct confirmed mobile sizing defects and recheck changed screens. Final preview build passed. Coverage excludes the gaps below; no authentication, real submissions, backend/admin changes or publication.
- [x] Complete focused preview hypothesis checks: Settings keyboard focus, About/legal buttons and dialogs, video framing, Shorts overlap; confirmed frontend-only fixes and final build verified. No backend/admin access or publication.
- [ ] Verify avatar removal, signed-in library/content, submission success/confirmation states — blocked by the explicit no-authentication/no-submission audit scope.
- [ ] Exhaustive media failure/stall cases, every channel/category/content variant, real-device safe-area behavior — require additional content fixtures or physical-device testing; not claimed as covered.
- [x] Backend: daily full-library YouTube viewCount refresh (50 IDs/call), resumable chunked job with durable progress + lock, bulk updates, separate stats sync timestamp, missing-ID recording, bounded retries, quota stop, repair quota-recording function (primary/backup attempts, Pacific midnight reset), replace old view-count schedule only, UI shows YouTube count, trigger one initial full run and verify.
