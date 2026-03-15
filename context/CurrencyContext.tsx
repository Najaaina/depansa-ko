import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  settingsService,
  CURRENCIES,
  type Currency,
} from "@/services/settings.service";
import {
  exchangeRateService,
  type ExchangeRates,
} from "@/services/exchange-rate.service";

const BASE_CURRENCY = "MGA";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  formatAmount: (amount: number) => string;
  convertAndFormat: (amountInBase: number) => string;
  convert: (amount: number, fromCurrency?: string) => number;
  ratesLoaded: boolean;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      await settingsService.initialize();
      setCurrencyState(settingsService.getCurrency());
      const fetchedRates = await exchangeRateService.getRates();
      setRates(fetchedRates);
      setRatesLoaded(true);
    };
    init();
  }, []);

  const setCurrency = async (newCurrency: Currency) => {
    await settingsService.setSettings({ currency: newCurrency.code });
    setCurrencyState(newCurrency);
  };

 const formatAmount = useCallback(
  (amount: number): string => {
    const noDecimals = ["MGA", "JPY"].includes(currency.code);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    }).format(amount);
  },
  [currency]
);

  const convert = useCallback(
    (amount: number, fromCurrency: string = BASE_CURRENCY): number => {
      if (!rates) return amount;
      return exchangeRateService.convertSync(
        amount,
        fromCurrency,
        currency.code,
        rates
      );
    },
    [currency, rates]
  );

  const convertAndFormat = useCallback(
    (amountInBase: number): string => {
      const converted = convert(amountInBase);
      return formatAmount(converted);
    },
    [convert, formatAmount]
  );

  const refreshRates = async () => {
    const fresh = await exchangeRateService.forceRefresh();
    setRates(fresh);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        convertAndFormat,
        convert,
        ratesLoaded,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context)
    throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};