# Roadmap

- [ ] Continue accessible user-facing preview design QA: route screenshots and interactions, responsive light/dark checks, observed frontend-only fixes, final build verification. No backend/admin access or publication; report inaccessible states honestly.
- [x] Backend: daily full-library YouTube viewCount refresh (50 IDs/call), resumable chunked job with durable progress + lock, bulk updates, separate stats sync timestamp, missing-ID recording, bounded retries, quota stop, repair quota-recording function (primary/backup attempts, Pacific midnight reset), replace old view-count schedule only, UI shows YouTube count, trigger one initial full run and verify.
