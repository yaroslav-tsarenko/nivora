import { sanitizeProductDescription } from "@/lib/utils/sanitize-html";

interface RichTextProps {
  html: string | null | undefined;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Renders vendor product HTML (BigBuy / Woo exports) safely.
 *
 * Vendors send descriptions containing real `<br/>` tags OR entity-encoded
 * (`&lt;br/&gt;`) markup. If we drop that into JSX as text (`{value}`), React
 * escapes everything and users see raw `<br/>` in the copy. This wrapper
 * decodes entities, sanitises to an allow-list of tags, then injects via
 * `dangerouslySetInnerHTML` so paragraphs, lists and line breaks render.
 */
export function RichText({ html, className, as: Tag = "div" }: RichTextProps) {
  if (!html) return null;
  const safe = sanitizeProductDescription(html);
  if (!safe) return null;
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
