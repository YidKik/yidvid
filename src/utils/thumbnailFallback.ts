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
      target.src = FALLBACK_SVG;
    },
    true
  );
};

export const THUMBNAIL_FALLBACK_SRC = FALLBACK_SVG;
