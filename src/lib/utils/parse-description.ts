/**
 * Vendor product descriptions (BigBuy / WooCommerce) arrive as a flat
 * `<br/>`-separated string that mixes a short narrative with dozens of
 * "Label: value" spec lines. Rendering it as one blob looks like a wall
 * of text — parse it into (narrative paragraphs, grouped specs).
 *
 * A spec line is `Key: value`. When keys share a prefix separated by `/`
 * (e.g. `Input/Output connectors / USB 3.2`) we group them together into
 * a section, so the rendered spec table has real structure.
 */

export type SpecEntry = { label: string; value: string };
export type SpecGroup = { title: string; entries: SpecEntry[] };
export type ParsedDescription = {
  narrative: string[];
  groups: SpecGroup[];
  fullDescriptionLine?: string;
};

const NOISE_LINE_LABELS = new Set([
  "full description line",
  "category code",
]);

function stripTags(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitOnBreaks(html: string): string[] {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/?\s*p\s*[^>]*>/gi, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpecLine(line: string): SpecEntry | null {
  const clean = stripTags(line);
  if (!clean) return null;
  const colon = clean.indexOf(":");
  if (colon <= 0 || colon > 80) return null;
  const label = clean.slice(0, colon).trim();
  const value = clean.slice(colon + 1).trim();
  if (!label || !value) return null;
  // A "label" full of spaces/punctuation is unlikely a real key.
  if (label.length > 80 || /[.!?]$/.test(label)) return null;
  return { label, value };
}

function groupKeyFor(label: string): { title: string; leaf: string } {
  const parts = label.split(/\s*\/\s*/);
  if (parts.length === 1) return { title: "General", leaf: parts[0] };
  return {
    title: parts.slice(0, -1).join(" / "),
    leaf: parts[parts.length - 1],
  };
}

export function parseProductDescription(html: string): ParsedDescription {
  const lines = splitOnBreaks(html);
  const narrative: string[] = [];
  const groupsMap = new Map<string, SpecEntry[]>();
  let fullDescriptionLine: string | undefined;
  let seenFirstSpec = false;

  for (const line of lines) {
    const spec = parseSpecLine(line);

    if (!spec) {
      // Free-text — allow only before we've seen any spec, to keep the
      // narrative separate from mid-spec commentary.
      if (!seenFirstSpec) {
        const text = stripTags(line);
        if (text) narrative.push(text);
      }
      continue;
    }

    seenFirstSpec = true;
    const lowerLabel = spec.label.toLowerCase();

    if (lowerLabel === "full description line") {
      fullDescriptionLine = spec.value;
      continue;
    }
    if (NOISE_LINE_LABELS.has(lowerLabel)) {
      continue;
    }

    const { title, leaf } = groupKeyFor(spec.label);
    if (!groupsMap.has(title)) groupsMap.set(title, []);
    groupsMap.get(title)!.push({ label: leaf, value: spec.value });
  }

  const groups: SpecGroup[] = Array.from(groupsMap.entries()).map(
    ([title, entries]) => ({ title, entries }),
  );

  return { narrative, groups, fullDescriptionLine };
}
