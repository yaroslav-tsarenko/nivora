/**
 * Product image helpers.
 *
 * We do NOT swap missing images for random Picsum photos — that produced
 * cars/landscapes on unrelated products. Instead we ship a small inline
 * SVG "no image" placeholder so the layout stays clean without pretending
 * the product has a photo.
 */

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#FFFFFF"/>
  <g fill="none" stroke="#CBD5E1" stroke-width="1.5">
    <rect x="120" y="140" width="160" height="120" rx="8"/>
    <path d="M120 220 L170 175 L215 205 L260 165 L280 195"/>
    <circle cx="240" cy="170" r="10"/>
  </g>
  <text x="200" y="300" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#1E6BE6" letter-spacing="2">NIVRO</text>
  <text x="200" y="322" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" fill="#94A3B8" letter-spacing="2">IMAGE UNAVAILABLE</text>
</svg>`;

const PLACEHOLDER_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`;

/**
 * Hosts whose /wp-content/uploads/* URLs we treat as same-origin. When the
 * old WordPress domain got repointed to this Next.js app, absolute image
 * URLs stopped resolving. Rewriting them to a same-origin path lets the
 * `WP_IMAGE_UPSTREAM` rewrite in next.config.ts proxy them to whatever
 * host still holds the files.
 */
const LEGACY_WP_HOSTS = new Set([
  "nivro.co.uk",
  "www.nivro.co.uk",
]);

function toSameOrigin(url: string): string {
  try {
    const u = new URL(url);
    if (LEGACY_WP_HOSTS.has(u.host) && u.pathname.startsWith("/wp-content/")) {
      return `${u.pathname}${u.search}`;
    }
  } catch {
    /* not an absolute URL — leave untouched */
  }
  return url;
}

/**
 * Return the original image URL if present, otherwise the branded
 * "no image" placeholder. Absolute URLs pointing at the legacy WP host
 * are rewritten to same-origin so they can be proxied.
 */
export function getProductImage(
  imageUrl: string | null | undefined,
  _productName?: string,
  _size = "400x400",
): string {
  void _productName;
  void _size;
  if (!imageUrl) return PLACEHOLDER_DATA_URL;
  if (imageUrl.startsWith("/")) return imageUrl;
  if (imageUrl.startsWith("http")) return toSameOrigin(imageUrl);
  return PLACEHOLDER_DATA_URL;
}

/**
 * Placeholder used when a remote image fails to load.
 */
export function getProductImageFallback(_size = "400x400", _key?: string): string {
  void _size;
  void _key;
  return PLACEHOLDER_DATA_URL;
}
