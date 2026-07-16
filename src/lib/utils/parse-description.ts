/**
 * Vendor product descriptions (BigBuy / WooCommerce) arrive as a flat
 * `<br/>`-separated string that mixes a short marketing paragraph with
 * dozens of "Label: value" spec lines. Rendering it as one blob looks
 * like a wall of text — parse it into:
 *   - narrative paragraphs (with bullets pulled out into a list), and
 *   - grouped specs (grouped by the `Prefix / Leaf` naming convention).
 */

export type SpecEntry = { label: string; value: string };
export type SpecGroup = { title: string; entries: SpecEntry[] };
export type NarrativeBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };
export type ParsedDescription = {
  narrative: NarrativeBlock[];
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

/**
 * A "label" in a spec line is short, has no sentence structure, and only
 * a handful of words. Marketing text also has colons ("A big leap forward
 * in productivity: The M2540idw...") so we must be strict here or the
 * whole intro paragraph gets misclassified as a spec.
 */
function looksLikeSpecLabel(label: string): boolean {
  if (!label) return false;
  if (label.length > 45) return false;
  if (/[.!?]/.test(label)) return false;
  if (/^[-•*·]/.test(label)) return false;
  const words = label.split(/[\s/]+/).filter(Boolean);
  if (words.length > 6) return false;
  // First character should be alphanumeric — colons inside URLs etc. leak in.
  if (!/^[A-Za-z0-9]/.test(label)) return false;
  return true;
}

function parseSpecLine(line: string): SpecEntry | null {
  const clean = stripTags(line);
  if (!clean) return null;
  const colon = clean.indexOf(":");
  if (colon <= 0 || colon > 50) return null;
  const label = clean.slice(0, colon).trim();
  const value = clean.slice(colon + 1).trim();
  if (!value) return null;
  if (value.length > 300) return null;
  if (!looksLikeSpecLabel(label)) return null;
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

/**
 * Split narrative text on inline bullet markers ("- foo - bar - baz")
 * into a list, and on sentence colons ("Intro: The device does X.")
 * into a lead sentence + body. Everything else stays a plain paragraph.
 */
function narrativeToBlocks(paragraphs: string[]): NarrativeBlock[] {
  const blocks: NarrativeBlock[] = [];
  for (const paragraph of paragraphs) {
    const bulletMatch = paragraph.match(/^(.*?)((?:\s-\s).+)$/);
    if (bulletMatch) {
      const lead = bulletMatch[1].trim();
      const rest = bulletMatch[2];
      if (lead) blocks.push({ kind: "paragraph", text: lead });
      const items = rest
        .split(/\s-\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (items.length > 0) blocks.push({ kind: "list", items });
    } else {
      blocks.push({ kind: "paragraph", text: paragraph });
    }
  }
  return blocks;
}

export function parseProductDescription(html: string): ParsedDescription {
  const lines = splitOnBreaks(html);
  const narrativeParagraphs: string[] = [];
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
        if (text) narrativeParagraphs.push(text);
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

  return {
    narrative: narrativeToBlocks(narrativeParagraphs),
    groups,
    fullDescriptionLine,
  };
}
