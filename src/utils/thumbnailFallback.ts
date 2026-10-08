// Branded fallback for YouTube thumbnails that fail to load (blocked CDN, removed video).
// Swaps only the image source; element size/classes stay the same so layout is preserved,
// and no filtering decision is affected (only already-rendered images are touched).
const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#242832"/>
      <rect x="128" y="62" width="64" height="44" rx="12" fill="#C9253A"/>
      <path d="M152 72 L174 84 L152 96 Z" fill="#FFFFFF"/>
      <text x="160" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#F2F4F7">YidVid</text>
    </svg>`
  );

// Featured cards overlay title text on the lower half, so branding sits top-left, small.
const FEATURED_FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2C313C"/><stop offset="1" stop-color="#181B22"/></linearGradient></defs>
      <rect width="320" height="180" fill="url(#g)"/>
      <rect x="16" y="16" width="32" height="22" rx="6" fill="#C9253A"/>
      <path d="M28 21 L39 27 L28 33 Z" fill="#FFFFFF"/>
      <text x="56" y="32" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#F2F4F7">YidVid</text>
    </svg>`
  );

const isYouTubeThumb = (src: string) => /(^https?:)?\/\/(i\d?\.ytimg\.com|img\.youtube\.com)\//.test(src);

let installed = false;

export const installThumbnailFallback = () => {
  if (installed || typeof document === "undefined") return;
  installed = true;
  document.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (target.dataset.thumbFallback === "1") return;
      const src = target.currentSrc || target.src || "";
      if (!isYouTubeThumb(src)) return;
      target.dataset.thumbFallback = "1";
      target.removeAttribute("srcset");
      target.src = target.dataset.thumbVariant === "featured" ? FEATURED_FALLBACK_SVG : FALLBACK_SVG;
    },
    true
  );
};

export const THUMBNAIL_FALLBACK_SRC = FALLBACK_SVG;
