"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, ShieldCheck, X, Check } from "lucide-react";

const STORAGE_KEY = "nivro-cookie-consent-v1";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
};

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (consent: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      /* noop */
    }
    setVisible(false);
  };

  const acceptAll = () =>
    persist({
      necessary: true,
      analytics: true,
      marketing: true,
      acceptedAt: new Date().toISOString(),
    });

  const rejectAll = () =>
    persist({
      necessary: true,
      analytics: false,
      marketing: false,
      acceptedAt: new Date().toISOString(),
    });

  const saveChoice = () =>
    persist({
      necessary: true,
      analytics,
      marketing,
      acceptedAt: new Date().toISOString(),
    });

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-3 sm:px-5 sm:pb-5"
        >
          <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-2xl border border-white/10 bg-[#111826] text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)]">
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E6BE6] to-[#0FB5A6] text-white shadow-[0_8px_24px_rgba(30,107,230,0.35)]">
                    <Cookie size={20} />
                  </span>
                  <div>
                    <h2
                      id="cookie-consent-title"
                      className="font-display text-[18px] font-bold leading-tight text-white sm:text-[20px]"
                    >
                      We value your privacy
                    </h2>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-white/70">
                      Nivro uses cookies to keep the site secure, remember your
                      preferences, measure how our shop performs and personalise
                      offers. You can accept everything, reject non-essential
                      cookies, or fine-tune your choices below. Read our{" "}
                      <Link
                        href="/policies/cookies"
                        className="font-semibold text-white underline underline-offset-2 hover:text-[#5EE0D1]"
                      >
                        Cookie Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/policies/privacy"
                        className="font-semibold text-white underline underline-offset-2 hover:text-[#5EE0D1]"
                      >
                        Privacy Notice
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
                          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5EE0D1]/15 text-[#5EE0D1]">
                            <ShieldCheck size={14} />
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[13px] font-semibold text-white">
                                Strictly necessary
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5EE0D1]">
                                Always on
                              </span>
                            </div>
                            <p className="mt-1 text-[12px] leading-relaxed text-white/60">
                              Basket, checkout, login sessions and fraud
                              prevention.
                            </p>
                          </div>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 transition-colors hover:border-white/20">
                          <input
                            type="checkbox"
                            checked={analytics}
                            onChange={(e) => setAnalytics(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#1E6BE6]"
                          />
                          <div className="flex-1">
                            <span className="text-[13px] font-semibold text-white">
                              Analytics
                            </span>
                            <p className="mt-1 text-[12px] leading-relaxed text-white/60">
                              Anonymous usage data to improve pages, search and
                              product listings.
                            </p>
                          </div>
                        </label>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 transition-colors hover:border-white/20">
                          <input
                            type="checkbox"
                            checked={marketing}
                            onChange={(e) => setMarketing(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#1E6BE6]"
                          />
                          <div className="flex-1">
                            <span className="text-[13px] font-semibold text-white">
                              Marketing
                            </span>
                            <p className="mt-1 text-[12px] leading-relaxed text-white/60">
                              Personalised offers and measuring ad performance.
                            </p>
                          </div>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5EE0D1] transition-colors hover:text-white"
                >
                  {expanded ? "Hide preferences" : "Manage preferences"}
                </button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch lg:justify-center">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#1E6BE6] to-[#0FB5A6] px-6 py-3 text-[13px] font-bold text-white shadow-[0_10px_28px_rgba(30,107,230,0.4)] transition-transform hover:-translate-y-0.5"
                >
                  <Check size={14} /> Accept all
                </button>
                {expanded ? (
                  <button
                    type="button"
                    onClick={saveChoice}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-[13px] font-bold text-white transition-colors hover:border-white/40 hover:bg-white/10"
                  >
                    Save my choices
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-[13px] font-bold text-white transition-colors hover:border-white/40 hover:bg-white/10"
                  >
                    <X size={14} /> Reject non-essential
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
