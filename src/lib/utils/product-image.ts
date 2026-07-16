/**
 * Product image helpers.
 *
 * We do NOT swap missing images for random Picsum photos — that produced
 * cars/landscapes on unrelated products. Instead we ship a small inline
 * SVG "no image" placeholder so the layout stays clean without pretending
 * the product has a photo.
 */

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0F1826"/>
      <stop offset="1" stop-color="#111826"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <g fill="none" stroke="#1E6BE6" stroke-opacity="0.35" stroke-width="1.5">
    <rect x="120" y="140" width="160" height="120" rx="8"/>
    <path d="M120 220 L170 175 L215 205 L260 165 L280 195"/>
    <circle cx="240" cy="170" r="10"/>
  </g>
  <text x="200" y="300" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#5EE0D1" letter-spacing="2">NIVRO</text>
  <text x="200" y="322" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" fill="#94A3B8" letter-spacing="2">IMAGE UNAVAILABLE</text>
</svg>`;

const PLACEHOLDER_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`;

/**
 * Return the original image URL if present, otherwise the branded
 * "no image" placeholder. Never returns a random remote image.
 */
export function getProductImage(
  imageUrl: string | null | undefined,
  _productName?: string,
  _size = "400x400",
): string {
  void _productName;
  void _size;
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/"))) {
    return imageUrl;
  }
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
