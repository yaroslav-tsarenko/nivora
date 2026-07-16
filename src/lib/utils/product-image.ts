const PLACEHOLDER_BASE = "https://placehold.co";

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function parseSize(size: string): { width: number; height: number } {
  const [w, h] = size.split("x").map((n) => parseInt(n, 10));
  return {
    width: Number.isFinite(w) && w > 0 ? w : 400,
    height: Number.isFinite(h) && h > 0 ? h : 400,
  };
}

/**
 * Deterministic Picsum image derived from the product key so each product
 * consistently gets the same placeholder photo. Uses Picsum's seeded API
 * (image loads reliably; no listed remotePatterns wildcard for placehold.co).
 */
function seededPicsum(key: string, size: string): string {
  const { width, height } = parseSize(size);
  const seed = hashString(key || "nivro") % 1000;
  return `https://picsum.photos/seed/nivro-${seed}/${width}/${height}`;
}

export function getProductImage(
  imageUrl: string | null | undefined,
  productName?: string,
  size = "400x400"
): string {
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/"))) {
    return imageUrl;
  }
  return seededPicsum(productName || "product", size);
}

export function getProductImageFallback(
  size = "400x400",
  key?: string,
): string {
  if (key) return seededPicsum(key, size);
  return `${PLACEHOLDER_BASE}/${size}/1E6BE6/FFFFFF?text=Nivro`;
}
