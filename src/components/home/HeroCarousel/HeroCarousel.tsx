"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Percent,
  Sparkles,
  Repeat,
  Play,
  Pause,
  Printer,
  Monitor,
  Cpu,
  Presentation,
  Projector,
  Headphones,
  Wind,
  Droplets,
  Scissors,
  FileStack,
  Package,
  LayoutGrid,
  Truck,
  ShieldCheck,
  Star,
} from "lucide-react";

/**
 * Nivro hero — vertically stacked composition (structurally different
 * from the previous "hero + sidebar tiles" split grid).
 *
 * Vertical order:
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │  1) FULL-BLEED primary campaign band                          │
 *   │     (edge-to-edge, single-slide carousel — no side tiles)     │
 *   └───────────────────────────────────────────────────────────────┘
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │  2) 3-UP horizontal promo strip                               │
 *   │     [ New arrivals | Deal of the week | Trade-in / 0% ]       │
 *   └───────────────────────────────────────────────────────────────┘
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │  3) Category quick-access chip rail                           │
 *   └───────────────────────────────────────────────────────────────┘
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │  4) Reassurance strip (delivery · returns · warranty · rating)│
 *   └───────────────────────────────────────────────────────────────┘
 */

interface Slide {
  id: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  sub: string;
  priceFrom: string;
  cta: { label: string };
  secondary: { label: string; href: string };
  // Candidate category slugs — the first one that exists in the DB is linked;
  // otherwise the CTA falls back to /catalog so it never dead-ends at a 404.
  targets: string[];
  image: string;
}

const slides: Slide[] = [
  {
    id: "computers",
    eyebrow: "Workspace Computing",
    headline: "Powerful computers,",
    headlineAccent: "built to work.",
    sub: "Desktop towers and all-in-one PCs for the office, home studio and everything in between. Free UK delivery on orders over £100.",
    priceFrom: "£199",
    cta: { label: "Shop computers" },
    secondary: { label: "See all offers", href: "/catalog?onSale=true" },
    targets: ["desktop-computers", "all-in-one-pcs"],
    image:
      "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=2000&q=80&auto=format&fit=crop",
  },
  {
    id: "printing",
    eyebrow: "Print & Supplies",
    headline: "Reliable printing,",
    headlineAccent: "every single page.",
    sub: "Laser and inkjet printers with genuine toner and ink supplies in stock. Keep the whole office running without a hitch.",
    priceFrom: "£89",
    cta: { label: "Shop printers" },
    secondary: { label: "Browse supplies", href: "/catalog?sort=newest" },
    targets: ["laser-printers", "laser-printer-supplies", "inkjet-supplies"],
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=2000&q=80&auto=format&fit=crop",
  },
  {
    id: "presentation",
    eyebrow: "Meetings & Presenting",
    headline: "Present with clarity,",
    headlineAccent: "in any room.",
    sub: "Projectors, screens and wireless presenters that make every meeting land. Expert setup available on request.",
    priceFrom: "£129",
    cta: { label: "Shop projectors" },
    secondary: { label: "Book setup", href: "/contact" },
    targets: ["projectors-screens", "presenters"],
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=2000&q=80&auto=format&fit=crop",
  },
  {
    id: "office",
    eyebrow: "Office Essentials",
    headline: "Everything for a",
    headlineAccent: "productive office.",
    sub: "Shredders, binding machines, headsets and cleaning products — the day-to-day kit that keeps your workspace tidy and sharp.",
    priceFrom: "£19",
    cta: { label: "Shop essentials" },
    secondary: { label: "Deals & clearance", href: "/catalog?onSale=true" },
    targets: ["shredders", "binding-machines", "cleaning-products", "headsets"],
    image:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=2000&q=80&auto=format&fit=crop",
  },
];

const promoTiles = [
  {
    id: "new-arrivals",
    eyebrow: "New arrivals",
    title: "Fresh stock this week",
    sub: "The latest office tech, hand-picked.",
    href: "/catalog?sort=newest",
    icon: Sparkles,
    accent: "teal" as const,
    image:
      "https://images.unsplash.com/photo-1593642532871-8b12e02d091c?w=1000&q=80&auto=format&fit=crop",
  },
  {
    id: "deal",
    eyebrow: "Deal of the week",
    title: "Save across the catalogue",
    sub: "Discounts on computing & printing — ends Sunday.",
    href: "/catalog?onSale=true",
    icon: Percent,
    accent: "coral" as const,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80&auto=format&fit=crop",
  },
  {
    id: "help",
    eyebrow: "Business support",
    title: "Talk to our team",
    sub: "Bulk orders, invoicing and expert advice.",
    href: "/contact",
    icon: Repeat,
    accent: "azure" as const,
    image:
      "https://images.unsplash.com/photo-1512446733611-9099a758e63c?w=1000&q=80&auto=format&fit=crop",
  },
];

const DEFAULT_QUICK_ICON = LayoutGrid;
const QUICK_ICON_BY_KEYWORD: Array<[RegExp, React.ElementType]> = [
  [/print/i, Printer],
  [/ink|toner|suppl/i, Droplets],
  [/all-?in-?one|desktop|comput|pc/i, Monitor],
  [/processor|cpu|component/i, Cpu],
  [/project|screen/i, Projector],
  [/present/i, Presentation],
  [/head|audio|sound/i, Headphones],
  [/air|condition|climate|vent/i, Wind],
  [/shred/i, Scissors],
  [/bind|paper|laminat/i, FileStack],
  [/clean/i, Droplets],
];

function quickIcon(name: string): React.ElementType {
  for (const [re, Icon] of QUICK_ICON_BY_KEYWORD) if (re.test(name)) return Icon;
  return DEFAULT_QUICK_ICON;
}

// Safe fallback rail shown only when no live categories are available.
const FALLBACK_QUICK = [
  { label: "All products", icon: LayoutGrid, href: "/catalog" },
  { label: "New arrivals", icon: Sparkles, href: "/catalog?sort=newest" },
  { label: "Deals", icon: Percent, href: "/catalog?onSale=true" },
  { label: "Support", icon: Package, href: "/contact" },
];

const reassurance = [
  { icon: Truck,       label: "Free UK delivery over £100" },
  { icon: Repeat,      label: "14-day return policy" },
  { icon: ShieldCheck, label: "2-year Nivro warranty" },
  { icon: Star,        label: "Rated 4.9 on Trustpilot" },
];

interface HeroCategory {
  name: string;
  slug: string;
  productCount?: number;
}

interface Props {
  slides?: unknown[];
  deals?: unknown[];
  categories?: HeroCategory[];
}

export function HeroCarousel({ categories = [] }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const touchStart = useRef<number | null>(null);
  const slide = slides[current];

  // Only link to category slugs that actually exist, so no CTA hits a 404.
  const realSlugs = new Set(categories.map((c) => c.slug));
  const hrefForTargets = (targets: string[]) => {
    const match = targets.find((t) => realSlugs.has(t));
    return match ? `/catalog/${match}` : "/catalog";
  };

  const quickItems =
    categories.length > 0
      ? categories.slice(0, 9).map((c) => ({
          label: c.name,
          href: `/catalog/${c.slug}`,
          icon: quickIcon(c.name),
        }))
      : FALLBACK_QUICK;

  const go = useCallback(
    (idx: number) => {
      setDir(idx > current ? 1 : -1);
      const wrapped = ((idx % slides.length) + slides.length) % slides.length;
      setCurrent(wrapped);
    },
    [current],
  );
  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDir(1);
      setCurrent((p) => (p + 1) % slides.length);
    }, 7500);
    return () => clearInterval(id);
  }, [paused]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    touchStart.current = null;
  };

  return (
    <section
      className="relative w-full bg-white dark:bg-[color:var(--color-bg)]"
      aria-label="Featured campaigns"
    >
      {/* ── 1. FULL-BLEED primary campaign band (edge-to-edge) ────── */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-[#F5F7FA] via-[#E8F0FE] to-[#E1F7F4] dark:from-[color:var(--color-bg)] dark:via-[color:var(--color-bg-elevated)] dark:to-[color:var(--color-bg-cool)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 retail-dots opacity-40" />

        {/* Background image, softened */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`bg-${slide.id}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0"
            aria-hidden
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-[0.16]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent dark:from-[color:var(--color-bg)]/90 dark:via-[color:var(--color-bg)]/60 dark:to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative mx-auto flex min-h-[420px] max-w-[1280px] flex-col items-start justify-center gap-6 px-4 py-14 sm:px-6 md:min-h-[500px] md:py-20 lg:px-8">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex max-w-[720px] flex-col gap-5"
            >
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1E6BE6] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white">
                <Sparkles size={11} />
                {slide.eyebrow}
              </span>
              <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.02] tracking-tight text-[color:var(--color-text)] md:text-[3rem] lg:text-[3.6rem]">
                {slide.headline}{" "}
                <span className="bg-gradient-to-r from-[#1E6BE6] to-[#0FB5A6] bg-clip-text text-transparent">
                  {slide.headlineAccent}
                </span>
              </h1>
              <p className="max-w-lg text-[15.5px] leading-relaxed text-[color:var(--color-text-secondary)] md:text-base">
                {slide.sub}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-teal)]/25 bg-[color:var(--color-teal-tint)] px-4 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-teal-hover)]">
                    From
                  </span>
                  <span className="text-[17px] font-bold tabular-nums text-[color:var(--color-teal-hover)]">
                    {slide.priceFrom}
                  </span>
                </div>
                <Link
                  href={hrefForTargets(slide.targets)}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#1E6BE6] px-6 py-3 text-[13.5px] font-bold text-white shadow-[0_6px_20px_rgba(30,107,230,0.28)] transition-all hover:bg-[#1857BF] hover:shadow-[0_10px_28px_rgba(30,107,230,0.42)]"
                >
                  {slide.cta.label}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href={slide.secondary.href}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[color:var(--color-text)] px-5 py-3 text-[13.5px] font-bold text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-text)] hover:text-[color:var(--color-bg)]"
                >
                  {slide.secondary.label}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide progress + controls — bottom-anchored, centered horizontal row */}
          <div className="mt-4 flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    i === current
                      ? "w-10 bg-[color:var(--color-primary)]"
                      : "w-2.5 bg-[color:var(--color-text)]/20 hover:bg-[color:var(--color-text)]/40",
                  ].join(" ")}
                />
              ))}
              <span className="ml-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] tabular-nums">
                {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play" : "Pause"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. 3-UP horizontal promo strip ─────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {promoTiles.map((tile) => {
            const chipClasses =
              tile.accent === "coral"
                ? "bg-[color:var(--color-coral-tint)] text-[color:var(--color-coral)]"
                : tile.accent === "teal"
                  ? "bg-[color:var(--color-teal-tint)] text-[color:var(--color-teal-hover)]"
                  : "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]";
            const border =
              tile.accent === "coral"
                ? "hover:border-[color:var(--color-coral)]"
                : tile.accent === "teal"
                  ? "hover:border-[color:var(--color-teal)]"
                  : "hover:border-[color:var(--color-primary)]";
            return (
              <Link
                key={tile.id}
                href={tile.href}
                className={`group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 text-[color:var(--color-text)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_rgba(30,107,230,0.30)] ${border}`}
              >
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="absolute inset-0 -z-0 object-cover opacity-[0.06] transition-transform duration-500 group-hover:scale-105"
                  aria-hidden
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${chipClasses}`}
                  >
                    <tile.icon size={11} />
                    {tile.eyebrow}
                  </span>
                  <ArrowRight
                    size={15}
                    className="text-[color:var(--color-text-secondary)] transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="relative z-10">
                  <div className="font-display text-[19px] font-bold leading-tight">
                    {tile.title}
                  </div>
                  <div className="mt-1.5 text-[13.5px] text-[color:var(--color-text-secondary)]">
                    {tile.sub}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 3. Category quick-access rail ──────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-4 pb-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white dark:bg-[color:var(--color-bg-elevated)]">
          <div className="scrollbar-none flex items-stretch overflow-x-auto">
            {quickItems.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group flex min-w-[112px] flex-1 shrink-0 flex-col items-center justify-center gap-1.5 border-r border-[color:var(--color-line)] px-4 py-3.5 text-[color:var(--color-text)] transition-colors last:border-r-0 hover:bg-[color:var(--color-primary-tint)] hover:text-[color:var(--color-primary)]"
              >
                <c.icon
                  size={20}
                  strokeWidth={1.75}
                  className="text-[color:var(--color-primary)] transition-transform group-hover:scale-110"
                />
                <span className="whitespace-nowrap text-[12.5px] font-semibold">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Reassurance strip ───────────────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {reassurance.map((r) => (
            <div
              key={r.label}
              className="inline-flex items-center gap-2.5 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] px-3.5 py-2.5"
            >
              <r.icon size={16} className="shrink-0 text-[color:var(--color-teal)]" />
              <span className="text-[12.5px] font-semibold text-[color:var(--color-text)]">
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
