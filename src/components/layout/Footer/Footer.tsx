"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  FaLinkedinIn,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa6";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Truck,
  RotateCcw,
  ShieldCheck,
  Globe,
  Repeat,
  Award,
  Lock,
  ChevronDown,
  Percent,
  Sparkles,
  Headphones,
} from "lucide-react";
import { NivroLogo } from "../NivroLogo";
import { brand } from "@/lib/brand";
import { useCurrency } from "@/providers/CurrencyProvider";
import visaLogo from "@/assets/visa-logo.svg";
import mastercardLogo from "@/assets/mastercard-logo.svg";
import pciDssLogo from "@/assets/pci-dss-compliant-logo-vector.svg";

/**
 * Nivro footer — editorial-tiered layout (structurally different from a
 * standard wide multi-column link-grid footer).
 *
 * Bands (top → bottom):
 *   A. Full-width top band — Newsletter (2/3) + Trade-in card (1/3), side-by-side
 *   B. Editorial navigation band — LARGE brand/company block on the LEFT
 *      taking more space, and 3 GROUPED accordion-friendly link sections on
 *      the right (Shop, Service & help, Company & legal) — not 5 equal cols
 *   C. Trust band — payments · security badges · Trustpilot · social
 *   D. Legal bar — copyright · registered company · country/currency · legal
 */

const shopLinks = [
  { href: "/catalog",                      label: "All products" },
  { href: "/catalog?onSale=true",          label: "Deals & clearance" },
  { href: "/catalog?sort=newest",          label: "New arrivals" },
  { href: "/catalog?sort=popular",         label: "Most popular" },
  { href: "/catalog?featured=true",        label: "Featured products" },
  { href: "/search",                       label: "Search catalog" },
];

const serviceLinks = [
  { href: "/contact",                   label: "Contact us" },
  { href: "/account/orders",            label: "Track my order" },
  { href: "/policies/returns",          label: "Returns & refunds" },
  { href: "/policies/warranty",         label: "Warranty & repairs" },
  { href: "/policies/shipping",         label: "Delivery info" },
  { href: "/policies/payment",          label: "Payment options" },
  { href: "/faq",                       label: "FAQ" },
  { href: "/contact",                   label: "Book installation" },
  { href: "/contact",                   label: "Trade-in valuation" },
];

const companyLinks = [
  { href: "/about",                     label: "About Nivro" },
  { href: "/contact",                   label: "Contact" },
  { href: "/policies",                  label: "Policies overview" },
  { href: "/policies/privacy",          label: "Privacy centre" },
  { href: "/policies/terms",            label: "Terms & conditions" },
  { href: "/policies/cookies",          label: "Cookie preferences" },
];

const legalLinks = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms",   label: "Terms" },
  { href: "/policies/cookies", label: "Cookies" },
];

const trustBadges = [
  { icon: Truck,       label: "Free delivery over £100" },
  { icon: RotateCcw,   label: "14-day easy returns" },
  { icon: ShieldCheck, label: "2-year Nivro warranty" },
  { icon: Repeat,      label: "Trade-in credit" },
];

const socialLinks = [
  { icon: FaLinkedinIn, label: "LinkedIn",  env: process.env.NEXT_PUBLIC_LINKEDIN_URL },
  { icon: FaInstagram,  label: "Instagram", env: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
  { icon: FaXTwitter,   label: "X",         env: process.env.NEXT_PUBLIC_TWITTER_URL },
  { icon: FaFacebookF,  label: "Facebook",  env: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { icon: FaYoutube,    label: "YouTube",   env: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  { icon: FaTiktok,     label: "TikTok",    env: process.env.NEXT_PUBLIC_TIKTOK_URL },
];

interface Group {
  key: string;
  title: string;
  items: Array<{ href: string; label: string }>;
}

const groups: Group[] = [
  { key: "shop",     title: "Shop",              items: shopLinks },
  { key: "service",  title: "Service & help",    items: serviceLinks },
  { key: "company",  title: "Company & legal",   items: companyLinks },
];

function LinkGroup({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 md:border-b-0">
      {/* Mobile accordion trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left md:hidden"
      >
        <span className="font-display text-[15px] font-bold text-white">
          {group.title}
        </span>
        <ChevronDown
          size={15}
          className={`text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {/* Desktop editorial header */}
      <h3 className="hidden pb-5 font-display text-[16px] font-bold text-white md:block">
        <span className="relative inline-block after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-[color:var(--color-teal)]">
          {group.title}
        </span>
      </h3>
      <ul
        className={`grid grid-cols-1 gap-y-2 pb-4 md:grid-cols-2 md:gap-x-6 md:gap-y-2.5 ${open ? "grid" : "hidden md:grid"}`}
        aria-hidden={!open}
      >
        {group.items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              className="text-[13.5px] text-white/70 transition-colors hover:text-white"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { currency } = useCurrency();

  return (
    <footer className="mt-auto" role="contentinfo">
      {/* ── A · TOP BAND — full-width newsletter + trade-in ───────── */}
      <div className="relative bg-[color:var(--color-bg-secondary)]">
        <div className="mx-auto grid max-w-[1280px] gap-4 px-4 py-14 sm:px-6 lg:grid-cols-[2fr_1fr] lg:gap-6 lg:px-8">
          {/* Newsletter — leading, larger */}
          <div className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-8 shadow-[0_1px_2px_rgba(17,24,38,0.04)] md:p-10">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[color:var(--color-primary-tint)] opacity-70" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-8 h-64 w-64 rounded-full bg-[color:var(--color-teal-tint)] opacity-50" />

            <div className="relative flex items-center gap-2.5">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#F0453A] px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white">
                <Sparkles size={12} /> Members-only
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
                Save 10% on your first order over £100
              </span>
            </div>

            <div className="relative">
              <h2 className="font-display text-[26px] font-extrabold leading-tight text-[color:var(--color-text)] md:text-[32px]">
                Deals, drops & price alerts —{" "}
                <span className="bg-gradient-to-r from-[#1E6BE6] to-[#0FB5A6] bg-clip-text text-transparent">
                  straight to your inbox.
                </span>
              </h2>
              <p className="mt-3 max-w-lg text-[14px] text-[color:var(--color-text-secondary)]">
                Join 120,000+ shoppers who get weekly deals, early access to
                clearance sales and a heads-up on restocks. One click to
                unsubscribe.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email) return;
                try {
                  await fetch("/api/newsletter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                } catch {
                  /* silent */
                }
                setSubscribed(true);
                setEmail("");
              }}
              className="relative flex flex-col gap-2 sm:flex-row"
              aria-label="Subscribe to Nivro newsletter"
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.co.uk"
                className="min-w-0 flex-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-5 py-3.5 text-[14.5px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] transition-all focus:border-[color:var(--color-primary)] focus:outline-none focus:shadow-[0_0_0_4px_rgba(30,107,230,0.14)]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1E6BE6] px-6 py-3.5 text-[13.5px] font-bold text-white transition-all hover:bg-[#1857BF] hover:shadow-[0_8px_24px_rgba(30,107,230,0.35)]"
              >
                Get 10% off <ArrowRight size={14} />
              </button>
            </form>
            {subscribed ? (
              <p className="relative inline-flex items-center gap-2 text-[13px] font-semibold text-[color:var(--color-teal-hover)]">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-teal)]" />
                Thanks — your 10% off code is on its way.
              </p>
            ) : (
              <p className="relative text-[11.5px] text-[color:var(--color-text-tertiary)]">
                By subscribing you agree to our{" "}
                <Link href="/policies/privacy" className="underline hover:text-[color:var(--color-primary)]">
                  Privacy Policy
                </Link>
                .
              </p>
            )}
          </div>

          {/* Trade-in */}
          <Link
            href="/contact"
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[color:var(--color-teal)]/25 bg-gradient-to-br from-[#1E6BE6] to-[#0FB5A6] p-8 text-white transition-all hover:shadow-[0_16px_36px_-14px_rgba(30,107,230,0.5)]"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 retail-dots opacity-25" />
            <div className="relative z-10 flex items-center gap-2">
              <Repeat size={16} />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]">
                Trade in · earn credit
              </span>
            </div>
            <div className="relative z-10 mt-4">
              <div className="font-display text-[22px] font-extrabold leading-tight">
                Level up your kit — up to £700 credit.
              </div>
              <p className="mt-2 text-[13.5px] text-white/85">
                Send us your old phone, laptop or console. Fair assessment,
                credited within 3 business days.
              </p>
            </div>
            <div className="relative z-10 mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.12em] transition-transform group-hover:translate-x-0.5">
              Start trade-in <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </div>

      {/* ── B · EDITORIAL NAVIGATION BAND — deep navy ─────────────
           Big brand/company block on the LEFT (more space) + 3 grouped
           link sections on the RIGHT. Not a 5-column flat grid.
      */}
      <div className="relative bg-[#111826] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-12 lg:px-8">
          {/* Big brand block */}
          <div className="flex flex-col gap-5">
            <Link href="/" aria-label="Nivro">
              <NivroLogo size={28} tone="light" />
            </Link>
            <p className="max-w-sm text-[14px] leading-relaxed text-white/70">
              Nivro is a bright, high-trust electronics retailer based in the
              United Kingdom. We stock audio, laptops, smartphones, TVs,
              cameras, smart home, gaming, wearables and accessories — with
              honest advice and no-fuss returns.
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[12.5px] text-white/85"
                >
                  <Icon size={13} className="shrink-0 text-[#5EE0D1]" />
                  <span className="line-clamp-1">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-col gap-2 text-[13px] text-white/70">
              <a href={`mailto:${brand.contact.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                  <Mail size={13} />
                </span>
                {brand.contact.email}
              </a>
              <a href={brand.contact.phoneHref} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                  <Phone size={13} />
                </span>
                {brand.contact.phone}
              </a>
              <span className="inline-flex items-start gap-2 text-white/60">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <MapPin size={13} />
                </span>
                <span className="not-italic">
                  {brand.company.legalName}
                  <br />
                  {brand.company.address.line1}, {brand.company.address.line2}
                  <br />
                  {brand.company.address.city}, {brand.company.address.region}{" "}
                  {brand.company.address.postcode}
                  <br />
                  {brand.company.address.country}
                  <br />
                  Company No. {brand.company.number}
                </span>
              </span>
            </div>

            <Link
              href="/catalog?onSale=true"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#1E6BE6] to-[#0FB5A6] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-[0_8px_24px_rgba(30,107,230,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(30,107,230,0.45)]"
            >
              <Percent size={13} /> Explore today&apos;s deals
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Right — 3 grouped columns */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-3">
            {groups.map((g) => (
              <LinkGroup key={g.key} group={g} />
            ))}
          </div>
        </div>
      </div>

      {/* ── C · TRUST BAND ────────────────────────────────────────── */}
      <div className="relative bg-[#111826] text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 border-t border-white/10 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8">
          {/* Payments + security */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="mr-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50">
              We accept:
            </span>
            {[
              { src: visaLogo, alt: "Visa" },
              { src: mastercardLogo, alt: "Mastercard" },
              { src: pciDssLogo, alt: "PCI DSS Compliant" },
            ].map(({ src, alt }) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={alt}
                src={src.src}
                alt={alt}
                style={{
                  height: 55,
                  width: "auto",
                  maxWidth: "none",
                  display: "inline-block",
                }}
                className="shrink-0"
              />
            ))}
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/85">
              <Lock size={11} className="text-[#5EE0D1]" />
              256-bit SSL
            </span>
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/85">
              <Award size={11} className="text-[#FFB84D]" />
              Buyer protection
            </span>
          </div>

          {/* Social */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              {socialLinks
                .filter((s) => s.env)
                .map(({ icon: Icon, label, env }) => (
                  <a
                    key={label}
                    href={env}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    <Icon size={12} />
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── D · LEGAL BAR — near-black ────────────────────────────── */}
      <div className="relative bg-[#0A0E17] text-white/70">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex flex-col gap-1 text-[12px]">
            <p>{t("copyright", { year: currentYear, storeName: brand.displayName })}</p>
            <p className="text-[11.5px] text-white/55">
              {brand.company.legalName} · Company No. {brand.company.number} ·{" "}
              {brand.company.address.line1}, {brand.company.address.line2},{" "}
              {brand.company.address.city}, {brand.company.address.postcode},{" "}
              {brand.company.address.country}
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/85">
              <Globe size={11} className="text-[#5EE0D1]" />
              <span>United Kingdom · English · {currency}</span>
            </div>
            <nav aria-label="Legal" className="flex flex-wrap items-center gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[12px] text-white/60 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-[12px] text-white/60 transition-colors hover:text-white"
              >
                <Headphones size={11} /> Contact support
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
