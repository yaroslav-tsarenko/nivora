"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type Currency = "GBP" | "EUR";

interface Rates {
  GBP: number;
  EUR: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amountInEur: number) => number;
  rates: Rates;
}

// Prices are stored in EUR, so the EUR rate is always 1.
const DEFAULT_RATES: Rates = { GBP: 0.85, EUR: 1 };
const SUPPORTED: Currency[] = ["GBP", "EUR"];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("GBP");
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);

  useEffect(() => {
    const stored = localStorage.getItem("currency") as Currency | null;
    if (stored && SUPPORTED.includes(stored)) {
      setCurrencyState(stored);
    }
  }, []);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) {
          setRates({ GBP: data.rates.GBP, EUR: 1 });
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  };

  const convert = useCallback(
    (amountInEur: number) => {
      return Math.round(amountInEur * rates[currency] * 100) / 100;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
