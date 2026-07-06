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
  Headphones,
  Laptop2,
  Smartphone,
  Tv,
  Camera,
  Home as HomeIcon,
  Gamepad2,
  Watch,
  Cable,
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
  cta: { label: string; href: string };
  secondary: { label: string; href: string };
  image: string;
}

const slides: Slide[] = [
  {
    id: "audio",
    eyebrow: "Autumn Audio Event",
    headline: "Bright, honest sound —",
    headlineAccent: "for every room.",
    sub: "Wireless headphones, home speakers and soundbars from Sony, Bose, Sonos and JBL. Free next-day delivery on £50+.",
    priceFrom: "£49",
    cta: { label: "Shop audio", href: "/catalog/audio-headphones" },
    secondary: { label: "See all offers", href: "/catalog?onSale=true" },
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=2000&q=80&auto=format&fit=crop",
  },
  {
    id: "laptops",
    eyebrow: "Back-to-work laptops",
    headline: "A laptop for every day,",
    headlineAccent: "at your budget.",
    sub: "From lightweight Chromebooks to pro-grade MacBooks. Split payment with 0% APR interest-free finance at checkout.",
    priceFrom: "£299",
    cta: { label: "Shop laptops", href: "/catalog/laptops-computers" },
    secondary: { label: "Compare models", href: "/catalog/laptops-computers" },
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=2000&q=80&auto=format&fit=crop",
  },
  {
    id: "tv",
    eyebrow: "TV & Video",
    headline: "Big-screen entertainment,",
    headlineAccent: "delivered & set up.",
    sub: "4K OLED and QLED TVs from LG, Sony and Samsung — with free 5-year warranty on selected models and expert installation.",
    priceFrom: "£399",
    cta: { label: "Shop TVs", href: "/catalog/tv-video" },
    secondary: { label: "Book installation", href: "/contact" },
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=2000&q=80&auto=format&fit=crop",
  },
  {
    id: "smart-home",
    eyebrow: "Smart Home",
    headline: "A smarter home,",
    headlineAccent: "in a single tap.",
    sub: "Voice hubs, smart lighting, security cameras and thermostats. Matter & Thread-ready, from just £29.",
    priceFrom: "£29",
    cta: { label: "Shop smart home", href: "/catalog/smart-home" },
    secondary: { label: "Deals & clearance", href: "/catalog?onSale=true" },
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=2000&q=80&auto=format&fit=crop",
  },
];

const promoTiles = [
  {
    id: "new-arrivals",
    eyebrow: "New arrivals",
    title: "Fresh drops this week",
    sub: "Latest phones, TVs & audio, hand-picked.",
    href: "/catalog?sort=newest",
    icon: Sparkles,
    accent: "teal" as const,
    image:
      "https://images.unsplash.com/photo-1593642532871-8b12e02d091c?w=1000&q=80&auto=format&fit=crop",
  },
  {
    id: "deal",
    eyebrow: "Deal of the week",
    title: "Up to 40% off select audio",
    sub: "Save on Sony, Bose & JBL — ends Sunday.",
    href: "/catalog?onSale=true",
    icon: Percent,
    accent: "coral" as const,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80&auto=format&fit=crop",
  },
  {
    id: "trade-in",
    eyebrow: "Trade in · 0% APR",
    title: "Upgrade with credit",
    sub: "Instant online valuation up to £700.",
    href: "/contact",
    icon: Repeat,
    accent: "azure" as const,
    image:
      "https://images.unsplash.com/photo-1512446733611-9099a758e63c?w=1000&q=80&auto=format&fit=crop",
  },
];

const quickAccess = [
  { label: "Audio",       icon: Headphones, href: "/catalog/audio-headphones" },
  { label: "Laptops",     icon: Laptop2,    href: "/catalog/laptops-computers" },
  { label: "Smartphones", icon: Smartphone, href: "/catalog/smartphones" },
  { label: "TV & Video",  icon: Tv,         href: "/catalog/tv-video" },
  { label: "Cameras",     icon: Camera,     href: "/catalog/cameras-photography" },
  { label: "Smart Home",  icon: HomeIcon,   href: "/catalog/smart-home" },
  { label: "Gaming",      icon: Gamepad2,   href: "/catalog/gaming" },
  { label: "Wearables",   icon: Watch,      href: "/catalog/wearables" },
  { label: "Accessories", icon: Cable,      href: "/catalog/accessories" },
];

const reassurance = [
  { icon: Truck,       label: "Free next-day delivery on £50+" },
  { icon: Repeat,      label: "30-day returns, no fuss" },
  { icon: ShieldCheck, label: "2-year Nivro warranty" },
  { icon: Star,        label: "Rated 4.9 on Trustpilot" },
];

interface Props {
  slides?: unknown[];
  deals?: unknown[];
}

export function HeroCarousel(_props: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const touchStart = useRef<number | null>(null);
  const slide = slides[current];

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
                  href={slide.cta.href}
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
            {quickAccess.map((c) => (
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
