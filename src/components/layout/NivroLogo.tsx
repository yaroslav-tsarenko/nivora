/**
 * Nivro wordmark — friendly geometric display face with a soft
 * azure→teal orb that reads as bright, retail, high-trust.
 */
export function NivroLogo({
  size = 24,
  tone = "dark",
}: {
  size?: number;
  tone?: "dark" | "light";
}) {
  const textColor =
    tone === "light" ? "text-white" : "text-[color:var(--color-text)]";
  return (
    <span className="inline-flex items-center gap-2 leading-none">
      <span
        aria-hidden
        className="relative inline-flex items-center justify-center rounded-full"
        style={{
          width: Math.max(20, Math.round(size * 1.05)),
          height: Math.max(20, Math.round(size * 1.05)),
          background:
            "linear-gradient(135deg, #1E6BE6 0%, #0FB5A6 100%)",
          boxShadow: "0 4px 14px rgba(30, 107, 230, 0.28)",
        }}
      >
        <span
          className="inline-block rounded-full bg-white"
          style={{
            width: Math.max(6, Math.round(size * 0.32)),
            height: Math.max(6, Math.round(size * 0.32)),
          }}
        />
      </span>
      <span
        className={`font-display font-bold tracking-tight ${textColor}`}
        style={{ fontSize: size }}
      >
        Nivro
      </span>
    </span>
  );
}

// Legacy aliases — kept so old imports don't break during the transition.
export const NivroMark = NivroLogo;
