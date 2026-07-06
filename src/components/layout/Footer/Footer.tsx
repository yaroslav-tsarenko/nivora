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
  Star,
  Smartphone,
  ChevronDown,
  Percent,
} from "lucide-react";
import { NivoraLogo } from "../NivoraLogo";
import { brand } from "@/lib/brand";
import visaLogo from "@/assets/visa-logo.svg";
import mastercardLogo from "@/assets/mastercard-logo.svg";
import pciDssLogo from "@/assets/pci-dss-compliant-logo-vector.svg";

/**
 * Utility mega-footer — 4 tiers.
 *
 *   Tier A · Conversion band — light paper (newsletter · trade-in · app)
 *   Tier B · Multi-column link grid — deep navy (5 columns of depth)
 *   Tier C · Trust & reassurance row — deep navy (payment · badges · rating)
 *   Tier D · Legal bar — near-black (copyright · registered co. · country · legal)
 */

const departments = [
  { href: "/catalog/audio-headphones",     label: "Audio & Headphones" },
  { href: "/catalog/laptops-computers",    label: "Laptops & Computers" },
  { href: "/catalog/smartphones",          label: "Smartphones" },
  { href: "/catalog/tv-video",             label: "TV & Video" },
  { href: "/catalog/cameras-photography",  label: "Cameras & Photography" },
  { href: "/catalog/smart-home",           label: "Smart Home" },
  { href: "/catalog/gaming",               label: "Gaming" },
  { href: "/catalog/wearables",            label: "Wearables" },
  { href: "/catalog/accessories",          label: "Accessories" },
];

const dealsLinks = [
  { href: "/catalog?onSale=true",       label: "All deals" },
  { href: "/catalog?onSale=true",       label: "Clearance" },
  { href: "/catalog?sort=newest",       label: "New arrivals" },
  { href: "/catalog?onSale=true",       label: "Weekly deal" },
  { href: "/contact",                   label: "Trade-in offers" },
  { href: "/contact",                   label: "0% APR finance" },
  { href: "/contact",                   label: "Bundles & multi-buy" },
  { href: "/contact",                   label: "Student discount" },
];

const serviceLinks = [
  { href: "/contact",                   label: "Contact us" },
  { href: "/account/orders",            label: "Track order" },
  { href: "/policies/returns",          label: "Returns & refunds" },
  { href: "/policies/warranty",         label: "Warranty & repairs" },
  { href: "/policies/shipping",         label: "Delivery info" },
  { href: "/policies/payment",          label: "Payment options" },
  { href: "/faq",                       label: "FAQ" },
  { href: "/contact",                   label: "Book installation" },
];

const companyLinks = [
  { href: "/about",                     label: "About Nivora" },
  { href: "/contact",                   label: "Careers" },
  { href: "/contact",                   label: "Press & media" },
  { href: "/policies",                  label: "Sustainability" },
  { href: "/contact",                   label: "Affiliates" },
  { href: "/contact",                   label: "For business" },
  { href: "/policies",                  label: "Modern Slavery" },
  { href: "/policies",                  label: "Investors" },
];

const helpLegalLinks = [
  { href: "/policies/privacy",          label: "Privacy centre" },
  { href: "/policies/terms",            label: "Terms & conditions" },
  { href: "/policies/cookies",          label: "Cookie preferences" },
  { href: "/policies",                  label: "Accessibility" },
  { href: "/policies",                  label: "WEEE recycling" },
  { href: "/policies",                  label: "Gift cards" },
  { href: "/policies",                  label: "Price match promise" },
];

const legalLinks = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms",   label: "Terms" },
  { href: "/policies/cookies", label: "Cookies" },
];

const trustBadges = [
  { icon: Truck,       label: "Free UK delivery over £50" },
  { icon: RotateCcw,   label: "30-day easy returns" },
  { icon: ShieldCheck, label: "2-year Nivora warranty" },
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

interface Column {
  key: string;
  title: string;
  items: Array<{ href: string; label: string }>;
}

const linkColumns: Column[] = [
  { key: "shop",     title: "Shop by department",  items: departments },
  { key: "deals",    title: "Deals & offers",      items: dealsLinks },
  { key: "service",  title: "Customer service",    items: serviceLinks },
  { key: "company",  title: "About & company",     items: companyLinks },
  { key: "help",     title: "Help & legal",        items: helpLegalLinks },
];

function AccordionColumn({ col }: { col: Column }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 md:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left md:hidden"
      >
        <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-white">
          {col.title}
        </span>
        <ChevronDown
          size={14}
          className={`text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <h3 className="hidden pb-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white md:block">
        {col.title}
      </h3>
      <ul
        className={`space-y-2.5 pb-4 md:block ${open ? "block" : "hidden"}`}
        aria-hidden={!open}
      >
        {col.items.map((it) => (
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

  return (
    <footer className="mt-auto" role="contentinfo">
      {/* ── Tier A · Conversion band — LIGHT PAPER ────────────────────── */}
      <div className="relative bg-[#F5F7FA]">
        <div className="mx-auto grid max-w-[1280px] gap-4 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-6 lg:px-8">
          {/* Newsletter */}
          <div className="flex flex-col gap-4 rounded-3xl border border-[#E3E7EC] bg-white p-7 shadow-[0_1px_2px_rgba(17,24,38,0.04)]">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1E6BE6]">
                <Mail size={17} />
              </span>
              <div className="flex flex-col">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#5B6472]">
                  Deals newsletter
                </span>
                <span className="font-display text-[19px] font-bold text-[#111826]">
                  Save on your next order
                </span>
              </div>
            </div>
            <p className="text-[13.5px] text-[#5B6472]">
              Sign up for weekly deals, price drops and exclusive members-only
              pricing. Get 10% off your first order over £100.
            </p>
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
              className="flex flex-col gap-2 sm:flex-row"
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
                className="min-w-0 flex-1 rounded-full border border-[#E3E7EC] bg-white px-5 py-3 text-[14px] text-[#111826] placeholder:text-[#8A94A6] transition-all focus:border-[#1E6BE6] focus:outline-none focus:shadow-[0_0_0_4px_rgba(30,107,230,0.14)]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1E6BE6] px-5 py-3 text-[13px] font-bold text-white transition-all hover:bg-[#1857BF] hover:shadow-[0_6px_20px_rgba(30,107,230,0.30)]"
              >
                Subscribe <ArrowRight size={14} />
              </button>
            </form>
            {subscribed ? (
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0B9A8D]">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[#0FB5A6]"
                />
                Thanks — check your inbox for your 10% off code.
              </p>
            ) : (
              <p className="text-[11.5px] text-[#8A94A6]">
                By subscribing you agree to our{" "}
                <Link href="/policies/privacy" className="underline hover:text-[#1E6BE6]">
                  Privacy Policy
                </Link>
                . One click to unsubscribe.
              </p>
            )}
          </div>

          {/* Trade-in callout */}
          <Link
            href="/contact"
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#0FB5A6]/25 bg-gradient-to-br from-[#1E6BE6] to-[#0FB5A6] p-7 text-white transition-all hover:shadow-[0_16px_36px_-14px_rgba(30,107,230,0.5)]"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 retail-dots opacity-25" />
            <div className="relative z-10 flex items-center gap-2">
              <Repeat size={16} />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]">
                Trade in · earn credit
              </span>
            </div>
            <div className="relative z-10 mt-4">
              <div className="font-display text-[20px] font-bold leading-tight">
                Level up your kit — up to £700 credit
              </div>
              <p className="mt-2 text-[13px] text-white/85">
                Send us your old phone, laptop or console. We assess it fairly
                and credit your account within 3 business days.
              </p>
            </div>
            <div className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.12em] transition-transform group-hover:translate-x-0.5">
              Start trade-in <ArrowRight size={13} />
            </div>
          </Link>

          {/* App download */}
          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#E3E7EC] bg-white p-7">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-[#1E6BE6]" />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#5B6472]">
                Nivora app
              </span>
            </div>
            <div>
              <div className="font-display text-[19px] font-bold leading-tight text-[#111826]">
                Get the Nivora app
              </div>
              <p className="mt-1.5 text-[13px] text-[#5B6472]">
                App-only offers, restock alerts and order tracking on the go.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#111826] bg-[#111826] px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white">
                App Store
              </span>
              <span className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#111826] bg-[#111826] px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white">
                Google Play
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier B · Multi-column link grid — DEEP NAVY ───────────────── */}
      <div className="relative bg-[#111826] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-x-8 gap-y-0 px-4 py-12 sm:px-6 md:grid-cols-3 lg:grid-cols-[1.15fr_1fr_1fr_1fr_1fr] lg:gap-y-4 lg:px-8">
          {linkColumns.map((col) => (
            <AccordionColumn key={col.key} col={col} />
          ))}
        </div>
      </div>

      {/* ── Tier C · Trust & reassurance ──────────────────────────────── */}
      <div className="relative bg-[#111826] text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 border-t border-white/10 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8">
          {/* Brand + trust badges */}
          <div className="flex flex-col gap-4 lg:max-w-md">
            <Link href="/" aria-label="Nivora">
              <NivoraLogo size={24} tone="light" />
            </Link>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[12px] text-white/85"
                >
                  <Icon size={13} className="shrink-0 text-[#5EE0D1]" />
                  <span className="line-clamp-1">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment / security / rating */}
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { src: visaLogo, alt: "Visa" },
                { src: mastercardLogo, alt: "Mastercard" },
                { src: pciDssLogo, alt: "PCI DSS Compliant" },
              ].map(({ src, alt }) => (
                <span
                  key={alt}
                  className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white px-2.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src.src}
                    alt={alt}
                    style={{
                      height: 18,
                      width: "auto",
                      maxWidth: "none",
                      display: "inline-block",
                    }}
                    className="shrink-0"
                  />
                </span>
              ))}
              {["PayPal", "Klarna", "Apple Pay"].map((p) => (
                <span
                  key={p}
                  className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/85"
                >
                  {p}
                </span>
              ))}
              <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/85">
                <Lock size={11} className="text-[#5EE0D1]" />
                256-bit SSL
              </span>
              <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/85">
                <Award size={11} className="text-[#FFB84D]" />
                Buyer Protection
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-0.5 text-[#0FB5A6]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={12} className="fill-current" strokeWidth={0} />
                  ))}
                </div>
                <span className="text-[13px] font-bold text-white tabular-nums">
                  4.9
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.12em] text-white/60">
                  Trustpilot · 12,400 reviews
                </span>
              </div>
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
      </div>

      {/* ── Tier D · Legal bar — NEAR BLACK ───────────────────────────── */}
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
            <p className="flex flex-wrap items-center gap-2 text-[11.5px] text-white/50">
              <a
                href={`mailto:${brand.contact.email}`}
                className="inline-flex items-center gap-1 transition-colors hover:text-white"
              >
                <Mail size={10} /> {brand.contact.email}
              </a>
              <span aria-hidden>·</span>
              <a
                href={brand.contact.phoneHref}
                className="inline-flex items-center gap-1 transition-colors hover:text-white"
              >
                <Phone size={10} /> {brand.contact.phone}
              </a>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={10} /> {brand.company.address.city}, UK
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/85">
              <Globe size={11} className="text-[#5EE0D1]" />
              <span>United Kingdom · English · GBP £</span>
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
                href="/catalog?onSale=true"
                className="inline-flex items-center gap-1 text-[12px] text-[#5EE0D1] transition-colors hover:text-white"
              >
                <Percent size={11} /> All deals
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
