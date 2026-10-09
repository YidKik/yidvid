# Roadmap

- [x] Full-site design QA (preview only, no backend): Home, Videos/search, categories, video/player, Shorts, Channels, channel detail, Library pages, Settings tabs, auth, About/Contact/Terms/Privacy, nav, menus/toasts. Widths 360/390/768/1024/1440 + landscape, both themes. Fix observed defects, build.
- [x] Backend: daily full-library YouTube viewCount refresh (50 IDs/call), resumable chunked job with durable progress + lock, bulk updates, separate stats sync timestamp, missing-ID recording, bounded retries, quota stop, repair quota-recording function (primary/backup attempts, Pacific midnight reset), replace old view-count schedule only, UI shows YouTube count, trigger one initial full run and verify.
