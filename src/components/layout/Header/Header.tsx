"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User as UserIcon,
  Shield,
  ChevronDown,
  ChevronRight,
  Heart,
  Package,
  MapPin,
  HelpCircle,
  Truck,
  GitCompare,
  LayoutGrid,
  Headphones,
  Laptop2,
  Smartphone,
  Tv,
  Camera,
  Home as HomeIcon,
  Gamepad2,
  Watch,
  Cable,
  Zap,
  Sparkles,
  ArrowRight,
  Trash2,
  Star,
  Percent,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { NivoraLogo } from "../NivoraLogo";
import { CurrencySwitcher } from "./CurrencySwitcher";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  children?: Category[];
}

/**
 * Nivora — coherent electronics taxonomy. 9 departments powering the
 * mega-menu, category rail, footer and quick-search scope.
 */
const DEPARTMENTS: Array<{
  slug: string;
  name: string;
  short: string;
  Icon: React.ElementType;
  tagline: string;
  featured: { label: string; slug: string }[];
  promo: { title: string; subtitle: string; href: string; badge: string };
}> = [
  {
    slug: "audio-headphones",
    name: "Audio & Headphones",
    short: "Audio",
    Icon: Headphones,
    tagline: "Wireless cans, IEMs, soundbars & speakers",
    featured: [
      { label: "Wireless headphones", slug: "audio-headphones" },
      { label: "Earbuds", slug: "audio-headphones" },
      { label: "Bluetooth speakers", slug: "audio-headphones" },
      { label: "Home audio", slug: "audio-headphones" },
      { label: "Soundbars", slug: "tv-video" },
      { label: "Microphones", slug: "audio-headphones" },
    ],
    promo: {
      title: "Sony · Bose · Sonos",
      subtitle: "Up to £120 off on flagship audio",
      href: "/catalog/audio-headphones",
      badge: "Save £120",
    },
  },
  {
    slug: "laptops-computers",
    name: "Laptops & Computers",
    short: "Laptops",
    Icon: Laptop2,
    tagline: "Laptops, PCs, storage & components",
    featured: [
      { label: "Laptops", slug: "laptops-computers" },
      { label: "Gaming laptops", slug: "laptops-computers" },
      { label: "Chromebooks", slug: "laptops-computers" },
      { label: "Desktop PCs", slug: "laptops-computers" },
      { label: "Monitors", slug: "laptops-computers" },
      { label: "Storage & SSDs", slug: "laptops-computers" },
    ],
    promo: {
      title: "MacBook & Surface",
      subtitle: "0% APR interest-free finance",
      href: "/catalog/laptops-computers",
      badge: "0% APR",
    },
  },
  {
    slug: "smartphones",
    name: "Smartphones",
    short: "Mobile",
    Icon: Smartphone,
    tagline: "Latest phones, SIM-free & upgrades",
    featured: [
      { label: "iPhone", slug: "smartphones" },
      { label: "Samsung Galaxy", slug: "smartphones" },
      { label: "Google Pixel", slug: "smartphones" },
      { label: "SIM-free phones", slug: "smartphones" },
      { label: "Refurbished", slug: "smartphones" },
      { label: "Cases & screens", slug: "accessories" },
    ],
    promo: {
      title: "Trade in your phone",
      subtitle: "Instant online valuation · up to £700",
      href: "/catalog/smartphones",
      badge: "Trade-in",
    },
  },
  {
    slug: "tv-video",
    name: "TV & Video",
    short: "TV",
    Icon: Tv,
    tagline: "4K OLED, QLED, projectors & streaming",
    featured: [
      { label: "OLED TVs", slug: "tv-video" },
      { label: "QLED TVs", slug: "tv-video" },
      { label: "Big-screen TVs", slug: "tv-video" },
      { label: "Streaming devices", slug: "tv-video" },
      { label: "Projectors", slug: "tv-video" },
      { label: "Blu-ray players", slug: "tv-video" },
    ],
    promo: {
      title: "Free 5-year TV warranty",
      subtitle: "On selected LG, Sony & Samsung sets",
      href: "/catalog/tv-video",
      badge: "5-yr warranty",
    },
  },
  {
    slug: "cameras-photography",
    name: "Cameras & Photography",
    short: "Cameras",
    Icon: Camera,
    tagline: "Mirrorless, DSLR, action & drones",
    featured: [
      { label: "Mirrorless cameras", slug: "cameras-photography" },
      { label: "DSLR cameras", slug: "cameras-photography" },
      { label: "Action cameras", slug: "cameras-photography" },
      { label: "Drones", slug: "cameras-photography" },
      { label: "Lenses", slug: "cameras-photography" },
      { label: "Tripods & gimbals", slug: "cameras-photography" },
    ],
    promo: {
      title: "Canon · Sony · DJI",
      subtitle: "Free lens or memory card bundles",
      href: "/catalog/cameras-photography",
      badge: "Bundle",
    },
  },
  {
    slug: "smart-home",
    name: "Smart Home",
    short: "Smart Home",
    Icon: HomeIcon,
    tagline: "Voice hubs, lighting, security & climate",
    featured: [
      { label: "Voice assistants", slug: "smart-home" },
      { label: "Smart lighting", slug: "smart-home" },
      { label: "Security cameras", slug: "smart-home" },
      { label: "Smart heating", slug: "smart-home" },
      { label: "Robot vacuums", slug: "smart-home" },
      { label: "Smart plugs", slug: "smart-home" },
    ],
    promo: {
      title: "Build your smart home",
      subtitle: "Matter & Thread hubs from £59",
      href: "/catalog/smart-home",
      badge: "New",
    },
  },
  {
    slug: "gaming",
    name: "Gaming",
    short: "Gaming",
    Icon: Gamepad2,
    tagline: "Consoles, games, VR & accessories",
    featured: [
      { label: "PlayStation 5", slug: "gaming" },
      { label: "Xbox Series X|S", slug: "gaming" },
      { label: "Nintendo Switch", slug: "gaming" },
      { label: "Gaming headsets", slug: "gaming" },
      { label: "Controllers", slug: "gaming" },
      { label: "VR headsets", slug: "gaming" },
    ],
    promo: {
      title: "Console bundles",
      subtitle: "Free game + extra pad this week",
      href: "/catalog/gaming",
      badge: "Bundle",
    },
  },
  {
    slug: "wearables",
    name: "Wearables",
    short: "Wearables",
    Icon: Watch,
    tagline: "Smartwatches & fitness trackers",
    featured: [
      { label: "Apple Watch", slug: "wearables" },
      { label: "Samsung Galaxy Watch", slug: "wearables" },
      { label: "Garmin", slug: "wearables" },
      { label: "Fitness trackers", slug: "wearables" },
      { label: "Kids' watches", slug: "wearables" },
      { label: "Straps & bands", slug: "wearables" },
    ],
    promo: {
      title: "New season smartwatches",
      subtitle: "From £129 with free strap",
      href: "/catalog/wearables",
      badge: "New in",
    },
  },
  {
    slug: "accessories",
    name: "Accessories",
    short: "Accessories",
    Icon: Cable,
    tagline: "Chargers, cables, power banks & cases",
    featured: [
      { label: "Chargers & USB-C", slug: "accessories" },
      { label: "Cables", slug: "accessories" },
      { label: "Power banks", slug: "accessories" },
      { label: "Phone cases", slug: "accessories" },
      { label: "Laptop bags", slug: "accessories" },
      { label: "Screen protectors", slug: "accessories" },
    ],
    promo: {
      title: "Save on essentials",
      subtitle: "Buy 2 accessories, get 15% off",
      href: "/catalog/accessories",
      badge: "Multi-buy",
    },
  },
];

const SEARCH_SCOPES = [
  { value: "all", label: "All departments" },
  ...DEPARTMENTS.map((d) => ({ value: d.slug, label: d.short })),
];

const ROTATING_PROMOS = [
  { icon: Truck, text: "Free UK delivery on orders over £50" },
  { icon: Package, text: "Order by 8pm for next-day delivery" },
  { icon: Zap, text: "0% interest-free finance available at checkout" },
  { icon: Sparkles, text: "Trade in your old device — up to £700 credit" },
  { icon: Star, text: "Rated 4.9 / 5 on Trustpilot · 12,400 reviews" },
];

function useDropdownDismiss(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);
  return ref;
}

export function Header() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { itemCount, cartBounce, cart, removeItem } = useCart();
  const items = cart.items;
  const subtotal = cart.subtotal;
  const { user, role } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<string>(DEPARTMENTS[0].slug);
  const [accountOpen, setAccountOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [scope, setScope] = useState<string>("all");
  const [scopeOpen, setScopeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [promoIdx, setPromoIdx] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchFocus, setSearchFocus] = useState(false);
  const [mobileAcc, setMobileAcc] = useState<string | null>(null);

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // — Scroll condensing
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // — Mobile drawer lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // — Rotating promo
  useEffect(() => {
    const t = setInterval(
      () => setPromoIdx((p) => (p + 1) % ROTATING_PROMOS.length),
      4500,
    );
    return () => clearInterval(t);
  }, []);

  // — Live categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  // — Recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nivora-recent-search");
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const pushRecent = (q: string) => {
    setRecentSearches((prev) => {
      const next = [q, ...prev.filter((v) => v !== q)].slice(0, 6);
      try {
        localStorage.setItem("nivora-recent-search", JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    pushRecent(q);
    const scopePath = scope === "all" ? "" : `&category=${scope}`;
    router.push(`/en/search?q=${encodeURIComponent(q)}${scopePath}`);
    setSearchFocus(false);
  };

  const findLiveDept = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug),
    [categories],
  );
  const activeDeptData = DEPARTMENTS.find((d) => d.slug === activeDept)!;
  const activeDeptLive = findLiveDept(activeDept);

  const openMega = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setMegaOpen(true);
  };
  const closeMegaSoon = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const megaDismissRef = useDropdownDismiss(() => setMegaOpen(false));
  const accountDismissRef = useDropdownDismiss(() => setAccountOpen(false));
  const cartDismissRef = useDropdownDismiss(() => setMiniCartOpen(false));
  const searchDismissRef = useDropdownDismiss(() => {
    setScopeOpen(false);
    setSearchFocus(false);
  });

  return (
    <>
      <header
        className={[
          "sticky top-0 z-40 w-full transition-shadow duration-300",
          "bg-white dark:bg-[color:var(--color-bg)]",
          scrolled
            ? "shadow-[0_1px_0_0_rgba(17,24,38,0.06),0_10px_30px_-20px_rgba(17,24,38,0.15)]"
            : "shadow-none",
        ].join(" ")}
        role="banner"
      >
        {/* ── Tier 1 · Utility strip (deep navy — collapses on scroll) ─── */}
        <div
          className={[
            "overflow-hidden bg-[#111826] text-white/85 transition-[max-height,opacity] duration-300",
            scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
          ].join(" ")}
          aria-hidden={scrolled}
        >
          <div className="relative mx-auto flex h-10 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide transition-colors hover:text-white"
              >
                <HelpCircle size={12} /> Help centre
              </Link>
              <span className="h-3 w-px bg-white/15" />
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide transition-colors hover:text-white"
              >
                <Package size={12} /> Track my order
              </Link>
              <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
              <Link
                href="/contact"
                className="hidden items-center gap-1.5 text-[11px] font-medium tracking-wide transition-colors hover:text-white sm:inline-flex"
              >
                <MapPin size={12} /> Store & stock finder
              </Link>
            </div>

            {/* Center — rotating shipping / promo message */}
            <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[11px] font-medium tracking-wide text-white/90 md:inline-flex">
              <AnimatePresence mode="wait">
                <motion.span
                  key={promoIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex items-center gap-1.5"
                >
                  {(() => {
                    const P = ROTATING_PROMOS[promoIdx];
                    return (
                      <>
                        <P.icon size={12} className="text-[#5EE0D1]" />
                        <span>{P.text}</span>
                      </>
                    );
                  })()}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 text-white">
              <ThemeToggle />
              <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
              <CurrencySwitcher />
              <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
              <span className="hidden text-[10px] uppercase tracking-[0.14em] text-white/70 sm:inline">
                UK · EN · GBP £
              </span>
            </div>
          </div>
        </div>

        {/* ── Tier 2 · Main bar (logo · big search · account/wishlist/cart) ── */}
        <div className="border-b border-[color:var(--color-line)] bg-white dark:bg-[color:var(--color-bg)]">
          <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3.5 sm:px-6 lg:gap-6 lg:px-8">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0"
              aria-label="Nivora"
            >
              <NivoraLogo size={scrolled ? 22 : 26} />
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)] lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* High-intent search with scope dropdown */}
            <div
              ref={searchDismissRef}
              className="relative hidden min-w-0 flex-1 lg:block"
            >
              <form
                onSubmit={handleSearch}
                className={[
                  "relative flex h-12 min-w-0 items-stretch overflow-hidden rounded-full border-2 bg-white transition-all dark:bg-[color:var(--color-bg-elevated)]",
                  searchFocus
                    ? "border-[#1E6BE6] shadow-[0_0_0_4px_rgba(30,107,230,0.14)]"
                    : "border-[color:var(--color-line)]",
                ].join(" ")}
              >
                {/* Scope selector */}
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={scopeOpen}
                    onClick={() => setScopeOpen((v) => !v)}
                    className="inline-flex h-full items-center gap-1.5 border-r border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] px-4 text-[12px] font-semibold text-[color:var(--color-text)] hover:bg-[#E8F0FE] hover:text-[#1E6BE6]"
                  >
                    <LayoutGrid size={14} className="text-[#1E6BE6]" />
                    <span className="max-w-[110px] truncate">
                      {SEARCH_SCOPES.find((s) => s.value === scope)?.label}
                    </span>
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {scopeOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        role="listbox"
                        className="absolute left-0 top-full z-30 mt-2 min-w-[240px] overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white py-1 shadow-lg dark:bg-[color:var(--color-bg-elevated)]"
                      >
                        {SEARCH_SCOPES.map((s) => (
                          <li key={s.value}>
                            <button
                              type="button"
                              onClick={() => {
                                setScope(s.value);
                                setScopeOpen(false);
                              }}
                              role="option"
                              aria-selected={scope === s.value}
                              className={[
                                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                                scope === s.value
                                  ? "bg-[#E8F0FE] text-[#1E6BE6]"
                                  : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]",
                              ].join(" ")}
                            >
                              {s.label}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  type="text"
                  className="min-w-0 flex-1 bg-transparent px-5 text-[15px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
                  placeholder="Search millions of products — laptops, TVs, headphones, cameras…"
                  value={searchQuery}
                  onFocus={() => setSearchFocus(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="inline-flex items-center gap-1.5 bg-[#1E6BE6] px-6 text-[13px] font-semibold text-white transition-all hover:bg-[#1857BF]"
                >
                  <Search size={16} /> Search
                </button>
              </form>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {searchFocus && (recentSearches.length > 0 || searchQuery.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white p-2 shadow-lg dark:bg-[color:var(--color-bg-elevated)]"
                    role="listbox"
                  >
                    {recentSearches.length > 0 && (
                      <div className="mb-1">
                        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                          Recent searches
                        </div>
                        {recentSearches.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchQuery(q);
                              router.push(`/en/search?q=${encodeURIComponent(q)}`);
                              setSearchFocus(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                          >
                            <Search size={13} className="text-[color:var(--color-text-tertiary)]" />
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                      Popular departments
                    </div>
                    {DEPARTMENTS.slice(0, 6).map((d) => (
                      <Link
                        key={d.slug}
                        href={`/catalog/${d.slug}`}
                        onClick={() => setSearchFocus(false)}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-[color:var(--color-text)] hover:bg-[#E8F0FE] hover:text-[#1E6BE6]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <d.Icon size={14} className="text-[#1E6BE6]" />
                          {d.name}
                        </span>
                        <ArrowRight size={12} className="text-[color:var(--color-text-tertiary)]" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right cluster — Account · Compare · Wishlist · Cart */}
            <div className="hidden items-center gap-1 lg:flex">
              {/* Account */}
              <div
                ref={accountDismissRef}
                className="relative"
                onMouseEnter={() => setAccountOpen(true)}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="inline-flex h-11 items-center gap-2 rounded-lg px-3 text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)]"
                >
                  <UserIcon size={20} strokeWidth={1.75} />
                  <span className="hidden text-left leading-tight xl:inline-flex xl:flex-col">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                      {user ? "Signed in" : "Hi there"}
                    </span>
                    <span className="text-[13px] font-semibold">
                      {user ? "Account" : "Sign in"}
                    </span>
                  </span>
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      role="menu"
                      className="absolute right-0 top-full z-30 mt-1 w-72 overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white p-2 shadow-lg dark:bg-[color:var(--color-bg-elevated)]"
                    >
                      {!user ? (
                        <>
                          <Link
                            href="/auth/login"
                            role="menuitem"
                            className="flex items-center justify-center rounded-lg bg-[#1E6BE6] px-3 py-2.5 text-center text-[13px] font-semibold text-white transition-all hover:bg-[#1857BF]"
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/auth/register"
                            role="menuitem"
                            className="mt-1 flex items-center justify-center rounded-lg border border-[color:var(--color-line)] px-3 py-2.5 text-center text-[13px] font-semibold text-[color:var(--color-text)] transition-colors hover:border-[#1E6BE6] hover:text-[#1E6BE6]"
                          >
                            Create account
                          </Link>
                          <div className="my-2 h-px bg-[color:var(--color-line)]" />
                        </>
                      ) : (
                        <div className="mb-2 rounded-lg bg-[#E8F0FE] p-3">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                            Signed in as
                          </div>
                          <div className="mt-0.5 truncate text-sm font-semibold text-[color:var(--color-text)]">
                            {user.email}
                          </div>
                        </div>
                      )}
                      {[
                        { href: "/account", icon: UserIcon, label: "My account" },
                        { href: "/account/orders", icon: Package, label: "My orders" },
                        { href: "/account/wishlist", icon: Heart, label: "Wishlist" },
                        { href: "/account/wishlist", icon: GitCompare, label: "Compare list" },
                        { href: "/contact", icon: HelpCircle, label: "Contact support" },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          role="menuitem"
                          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-[color:var(--color-text)] transition-colors hover:bg-[#E8F0FE] hover:text-[#1E6BE6]"
                        >
                          <item.icon size={14} className="text-[#1E6BE6]" />
                          {item.label}
                        </Link>
                      ))}
                      {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                        <NextLink
                          href="/admin"
                          role="menuitem"
                          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-[color:var(--color-text)] transition-colors hover:bg-[#E8F0FE] hover:text-[#1E6BE6]"
                        >
                          <Shield size={14} className="text-[#1E6BE6]" />
                          Admin panel
                        </NextLink>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Compare */}
              <Link
                href="/account/wishlist"
                className="inline-flex h-11 items-center gap-2 rounded-lg px-3 text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)]"
                aria-label="Compare"
              >
                <GitCompare size={20} strokeWidth={1.75} />
                <span className="hidden text-left leading-tight xl:inline-flex xl:flex-col">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                    Compare
                  </span>
                  <span className="text-[13px] font-semibold">0 items</span>
                </span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="inline-flex h-11 items-center gap-2 rounded-lg px-3 text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)]"
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={1.75} />
                <span className="hidden text-left leading-tight xl:inline-flex xl:flex-col">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                    Wishlist
                  </span>
                  <span className="text-[13px] font-semibold">Saved</span>
                </span>
              </Link>

              {/* Cart with mini-cart hover */}
              <div
                ref={cartDismissRef}
                className="relative"
                onMouseEnter={() => setMiniCartOpen(true)}
                onMouseLeave={() => setMiniCartOpen(false)}
              >
                <Link
                  href="/cart"
                  className="relative inline-flex h-11 items-center gap-2 rounded-full bg-[#1E6BE6] px-4 text-white transition-all hover:bg-[#1857BF] hover:shadow-[0_6px_20px_rgba(30,107,230,0.35)]"
                  aria-label={t("cart")}
                >
                  <div className="relative">
                    <ShoppingCart size={19} strokeWidth={1.75} />
                    {itemCount > 0 && (
                      <motion.span
                        key={cartBounce}
                        initial={cartBounce > 0 ? { scale: 0.5 } : false}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 400 }}
                        className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F0453A] px-1 text-[9px] font-bold text-white ring-2 ring-white"
                      >
                        {itemCount > 99 ? "99+" : itemCount}
                      </motion.span>
                    )}
                  </div>
                  <span className="hidden text-left leading-tight xl:inline-flex xl:flex-col">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-white/80">
                      Basket
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums">
                      £{subtotal.toFixed(2)}
                    </span>
                  </span>
                </Link>

                <AnimatePresence>
                  {miniCartOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-30 mt-2 w-[340px] overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white p-4 shadow-lg dark:bg-[color:var(--color-bg-elevated)]"
                    >
                      <div className="flex items-center justify-between pb-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                          Basket · {itemCount} item{itemCount === 1 ? "" : "s"}
                        </span>
                        <span className="text-[13px] font-bold text-[color:var(--color-text)] tabular-nums">
                          £{subtotal.toFixed(2)}
                        </span>
                      </div>
                      {items.length === 0 ? (
                        <div className="py-8 text-center text-sm text-[color:var(--color-text-tertiary)]">
                          Your basket is empty
                        </div>
                      ) : (
                        <>
                          <ul className="max-h-72 space-y-2 overflow-y-auto">
                            {items.slice(0, 4).map((it) => (
                              <li
                                key={it.productId}
                                className="flex items-center gap-3 rounded-lg border border-[color:var(--color-line)] p-2"
                              >
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[color:var(--color-bg-secondary)]">
                                  {it.imageUrl && (
                                    <Image
                                      src={it.imageUrl}
                                      alt={it.name}
                                      fill
                                      sizes="56px"
                                      className="object-contain p-1"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-xs font-semibold text-[color:var(--color-text)]">
                                    {it.name}
                                  </div>
                                  <div className="mt-0.5 text-[11px] text-[color:var(--color-text-tertiary)] tabular-nums">
                                    {it.quantity} × £{it.price.toFixed(2)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(it.productId)}
                                  aria-label="Remove item"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--color-text-tertiary)] hover:bg-[#FDE7E5] hover:text-[#F0453A]"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </li>
                            ))}
                          </ul>
                          {items.length > 4 && (
                            <div className="pt-2 text-center text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                              + {items.length - 4} more
                            </div>
                          )}
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link
                              href="/cart"
                              className="inline-flex items-center justify-center rounded-lg border border-[color:var(--color-line)] px-2 py-2.5 text-center text-[12px] font-semibold text-[color:var(--color-text)] transition-colors hover:border-[#1E6BE6] hover:text-[#1E6BE6]"
                            >
                              View basket
                            </Link>
                            <Link
                              href="/checkout"
                              className="inline-flex items-center justify-center rounded-lg bg-[#1E6BE6] px-2 py-2.5 text-center text-[12px] font-semibold text-white transition-colors hover:bg-[#1857BF]"
                            >
                              Checkout
                            </Link>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile search row */}
          <div className="border-t border-[color:var(--color-line)] px-4 py-2 lg:hidden">
            <form
              className="flex items-center rounded-full border-2 border-[color:var(--color-line)] bg-white pl-4 pr-1 focus-within:border-[#1E6BE6] dark:bg-[color:var(--color-bg-elevated)]"
              onSubmit={handleSearch}
            >
              <Search size={14} className="text-[color:var(--color-text-tertiary)]" />
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
                placeholder="Search Nivora"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                aria-label="Search"
                className="inline-flex h-8 items-center justify-center rounded-full bg-[#1E6BE6] px-4 text-[12px] font-semibold text-white"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* ── Tier 3 · Persistent department nav — mega-menu ─────────────── */}
        <div
          ref={megaDismissRef}
          className="hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] lg:block"
          onMouseLeave={closeMegaSoon}
        >
          <div className="mx-auto flex h-12 max-w-[1280px] items-center gap-1 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMegaOpen((v) => !v)}
              onMouseEnter={openMega}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              className={[
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-[12.5px] font-bold uppercase tracking-wide transition-all",
                megaOpen
                  ? "bg-[#1E6BE6] text-white shadow-[0_4px_14px_rgba(30,107,230,0.35)]"
                  : "bg-[#111826] text-white hover:bg-[#1E6BE6]",
              ].join(" ")}
            >
              <LayoutGrid size={14} />
              All categories
              <ChevronDown
                size={12}
                className={`transition-transform ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>

            {DEPARTMENTS.slice(0, 8).map((d) => (
              <button
                key={d.slug}
                type="button"
                onMouseEnter={() => {
                  openMega();
                  setActiveDept(d.slug);
                }}
                onClick={() => router.push(`/en/catalog/${d.slug}`)}
                className={[
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold transition-colors",
                  activeDept === d.slug && megaOpen
                    ? "bg-white text-[#1E6BE6] shadow-sm"
                    : "text-[color:var(--color-text)] hover:bg-white hover:text-[#1E6BE6]",
                ].join(" ")}
              >
                <d.Icon size={14} className="text-[#1E6BE6]" />
                {d.short}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 text-[12.5px] font-semibold">
              <Link
                href="/catalog?onSale=true"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#FDE7E5] px-2.5 py-1 text-[#F0453A] transition-colors hover:bg-[#F0453A] hover:text-white"
              >
                <Percent size={13} /> Deals
              </Link>
              <Link
                href="/catalog?sort=newest"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#E1F7F4] px-2.5 py-1 text-[#0B9A8D] transition-colors hover:bg-[#0FB5A6] hover:text-white"
              >
                <Sparkles size={13} /> New in
              </Link>
              <Link
                href="/contact"
                className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-[color:var(--color-text-secondary)] transition-colors hover:text-[#1E6BE6] xl:inline-flex"
              >
                Business
              </Link>
            </div>
          </div>

          {/* Mega-menu panel */}
          <AnimatePresence>
            {megaOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-x-0 top-full z-30 border-t border-[color:var(--color-line)] bg-white shadow-[0_28px_60px_-24px_rgba(17,24,38,0.25)] dark:bg-[color:var(--color-bg-elevated)]"
                onMouseEnter={openMega}
                onMouseLeave={closeMegaSoon}
                role="dialog"
                aria-label="Shop by department"
              >
                <div className="mx-auto grid max-w-[1280px] grid-cols-[240px_1fr_280px] gap-8 px-4 py-8 sm:px-6 lg:px-8">
                  {/* Rail — departments list */}
                  <nav
                    aria-label="Departments"
                    className="flex flex-col gap-1 border-r border-[color:var(--color-line)] pr-4"
                  >
                    {DEPARTMENTS.map((d) => (
                      <button
                        key={d.slug}
                        type="button"
                        onMouseEnter={() => setActiveDept(d.slug)}
                        onClick={() => router.push(`/en/catalog/${d.slug}`)}
                        className={[
                          "group flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium transition-colors",
                          activeDept === d.slug
                            ? "bg-[#E8F0FE] text-[#1E6BE6]"
                            : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]",
                        ].join(" ")}
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <d.Icon size={16} className="text-[#1E6BE6]" />
                          <span className="font-semibold">{d.name}</span>
                        </span>
                        <ChevronRight
                          size={13}
                          className={`transition-transform ${activeDept === d.slug ? "translate-x-0.5" : ""}`}
                        />
                      </button>
                    ))}
                  </nav>

                  {/* Center — sub-categories from live DB + featured brands */}
                  <div className="flex flex-col gap-5">
                    <div className="flex items-baseline justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                          Department
                        </span>
                        <Link
                          href={`/catalog/${activeDeptData.slug}`}
                          className="mt-0.5 font-display text-xl font-bold text-[color:var(--color-text)] hover:text-[#1E6BE6]"
                        >
                          {activeDeptData.name}
                        </Link>
                        <span className="mt-1 text-[13px] text-[color:var(--color-text-secondary)]">
                          {activeDeptData.tagline}
                        </span>
                      </div>
                      {activeDeptLive?._count && (
                        <span className="text-[11px] text-[color:var(--color-text-tertiary)] tabular-nums">
                          {activeDeptLive._count.products.toLocaleString()} products
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                        Shop by category
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {(activeDeptLive?.children?.length
                          ? activeDeptLive.children.map((sub) => ({
                              label: sub.name,
                              slug: sub.slug,
                              count: sub._count?.products,
                            }))
                          : activeDeptData.featured.map((f) => ({
                              label: f.label,
                              slug: f.slug,
                              count: undefined,
                            }))
                        ).map((sub) => (
                          <Link
                            key={sub.slug + sub.label}
                            href={`/catalog/${sub.slug}`}
                            className="group flex items-center justify-between rounded-md px-2 py-1.5 text-[13.5px] text-[color:var(--color-text)] transition-colors hover:bg-[#E8F0FE] hover:text-[#1E6BE6]"
                          >
                            <span>{sub.label}</span>
                            {typeof sub.count === "number" ? (
                              <span className="text-[11px] text-[color:var(--color-text-tertiary)] tabular-nums">
                                {sub.count}
                              </span>
                            ) : (
                              <ChevronRight
                                size={12}
                                className="opacity-0 transition-opacity group-hover:opacity-100"
                              />
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[color:var(--color-line)] pt-4">
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                        Featured brands
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {["Apple", "Samsung", "LG", "Sony", "Bose", "HP", "Lenovo", "Google"].map((b) => (
                          <Link
                            key={b}
                            href={`/search?q=${encodeURIComponent(b)}`}
                            className="inline-flex items-center rounded-full border border-[color:var(--color-line)] bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[color:var(--color-text)] transition-colors hover:border-[#1E6BE6] hover:bg-[#E8F0FE] hover:text-[#1E6BE6]"
                          >
                            {b}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right — promo tile */}
                  <Link
                    href={activeDeptData.promo.href}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-gradient-to-br from-[#1E6BE6] to-[#0FB5A6] p-5 text-white"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 retail-dots opacity-25"
                    />
                    <div className="relative z-10">
                      <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur">
                        {activeDeptData.promo.badge}
                      </span>
                      <div className="font-display text-xl font-bold leading-tight">
                        {activeDeptData.promo.title}
                      </div>
                      <div className="mt-1.5 text-[13px] text-white/85">
                        {activeDeptData.promo.subtitle}
                      </div>
                    </div>
                    <div className="relative z-10 mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white transition-transform group-hover:translate-x-0.5">
                      Shop now <ArrowRight size={13} />
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[color:var(--color-text)]/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[92%] max-w-sm flex-col bg-white shadow-xl dark:bg-[color:var(--color-bg)]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-5 py-4">
                <NivoraLogo size={22} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)]"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {/* Departments accordion */}
                <div className="mb-4">
                  <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                    Shop by department
                  </div>
                  {DEPARTMENTS.map((d) => {
                    const live = findLiveDept(d.slug);
                    const isOpen = mobileAcc === d.slug;
                    return (
                      <div
                        key={d.slug}
                        className="border-b border-[color:var(--color-line)]"
                      >
                        <button
                          type="button"
                          onClick={() => setMobileAcc(isOpen ? null : d.slug)}
                          className="flex w-full items-center justify-between gap-3 px-2 py-3 text-left text-[14px] font-semibold text-[color:var(--color-text)]"
                          aria-expanded={isOpen}
                        >
                          <span className="inline-flex items-center gap-3">
                            <d.Icon size={16} className="text-[#1E6BE6]" />
                            {d.name}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`text-[color:var(--color-text-tertiary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-1 py-2 pl-9 pr-2">
                                <Link
                                  href={`/catalog/${d.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="rounded-md px-2 py-1.5 text-sm font-semibold text-[#1E6BE6]"
                                >
                                  Shop all {d.short}
                                </Link>
                                {(live?.children ?? d.featured.map((f, i) => ({
                                  id: String(i),
                                  slug: f.slug,
                                  name: f.label,
                                  _count: { products: 0 },
                                }))).map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/catalog/${sub.slug}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                                  >
                                    {sub.name}
                                    {sub._count?.products ? (
                                      <span className="text-[10px] text-[color:var(--color-text-tertiary)] tabular-nums">
                                        {sub._count.products}
                                      </span>
                                    ) : null}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Utility links */}
                <div className="mb-4 flex flex-col gap-1">
                  <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                    Quick links
                  </div>
                  {[
                    { href: "/catalog?onSale=true", label: "Deals & clearance", icon: Percent },
                    { href: "/catalog?sort=newest", label: "New arrivals", icon: Sparkles },
                    { href: "/account/orders", label: "Track order", icon: Package },
                    { href: "/contact", label: "Help centre", icon: HelpCircle },
                    { href: "/contact", label: "Store & stock", icon: MapPin },
                  ].map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                    >
                      <l.icon size={14} className="text-[#1E6BE6]" />
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer of the drawer — account CTAs */}
              <div className="border-t border-[color:var(--color-line)] px-5 py-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#1E6BE6] text-sm font-semibold text-white"
                    >
                      My account
                    </Link>
                    {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                      <NextLink
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] text-sm font-semibold text-[color:var(--color-text)]"
                      >
                        Admin panel
                      </NextLink>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#1E6BE6] text-sm font-semibold text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full border-2 border-[#1E6BE6] text-sm font-semibold text-[#1E6BE6]"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
