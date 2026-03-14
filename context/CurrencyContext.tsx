import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { settingsService, CURRENCIES, type Currency } from "@/services/settings.service";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);

  useEffect(() => {
    settingsService.initialize().then(() => {
      setCurrencyState(settingsService.getCurrency());
    });
  }, []);

  const setCurrency = async (newCurrency: Currency) => {
    await settingsService.setSettings({ currency: newCurrency.code });
    setCurrencyState(newCurrency);
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};