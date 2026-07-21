"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency, type Currency } from "@/providers/CurrencyProvider";
import { ChevronDown } from "lucide-react";

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "GBP", symbol: "£", label: "GBP · Pound Sterling" },
  { code: "EUR", symbol: "€", label: "EUR · Euro" },
];

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change currency"
        className="inline-flex items-center gap-1 rounded-md border border-current/25 px-2 py-1 text-[11px] font-semibold tracking-wide text-current/85 transition-colors hover:bg-current/10 hover:text-current"
      >
        <span className="text-[13px] leading-none">{current.symbol}</span>
        <span>{current.code}</span>
        <ChevronDown size={11} className="opacity-70" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[200px] overflow-hidden rounded-lg border border-[color:var(--color-line)] bg-white shadow-lg dark:bg-[color:var(--color-bg-elevated)]"
        >
          <div className="border-b border-[color:var(--color-line)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
            Choose currency
          </div>
          {CURRENCIES.map((c) => {
            const active = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]"
                    : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                }`}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[color:var(--color-bg-secondary)] text-[13px] font-bold">
                  {c.symbol}
                </span>
                <span className="flex-1">{c.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
