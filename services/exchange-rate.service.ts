import { storageService } from "./storage.service";

const CACHE_KEY = "exchange_rates_cache";
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1h
const BASE_CURRENCY = "MGA";
const API_URL = "https://api.exchangerate-api.com/v4/latest/MGA";

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

const FALLBACK_RATES: Record<string, number> = {
  MGA: 1,
  USD: 0.000225,
  EUR: 0.000207,
  GBP: 0.000177,
  JPY: 0.0337,
  CNY: 0.00163,
  CHF: 0.000198,
  CAD: 0.000307,
  AUD: 0.000346,
  INR: 0.0188,
};

class ExchangeRateService {
  private cachedRates: ExchangeRates | null = null;

  async getRates(): Promise<ExchangeRates> {
    // 1. Mémoire
    if (this.cachedRates && this.isCacheValid(this.cachedRates.timestamp)) {
      return this.cachedRates;
    }

    // 2. Storage local
    try {
      const stored = await storageService.get(CACHE_KEY);
      if (stored) {
        const parsed: ExchangeRates = JSON.parse(stored);
        if (this.isCacheValid(parsed.timestamp)) {
          this.cachedRates = parsed;
          return parsed;
        }
      }
    } catch {}

    // 3. Fetch API
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const rates: ExchangeRates = {
        base: BASE_CURRENCY,
        rates: data.rates,
        timestamp: Date.now(),
      };
      this.cachedRates = rates;
      await storageService.set(CACHE_KEY, JSON.stringify(rates));
      return rates;
    } catch {
      console.warn("Exchange rate fetch failed, using fallback rates");
      return {
        base: BASE_CURRENCY,
        rates: FALLBACK_RATES,
        timestamp: Date.now(),
      };
    }
  }

  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    const rates = await this.getRates();

    // Convertir via MGA comme base
    const amountInBase =
      fromCurrency === BASE_CURRENCY
        ? amount
        : amount / (rates.rates[fromCurrency] ?? 1);

    const converted =
      toCurrency === BASE_CURRENCY
        ? amountInBase
        : amountInBase * (rates.rates[toCurrency] ?? 1);

    return converted;
  }

  convertSync(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: ExchangeRates
  ): number {
    if (fromCurrency === toCurrency) return amount;
    const amountInBase =
      fromCurrency === BASE_CURRENCY
        ? amount
        : amount / (rates.rates[fromCurrency] ?? 1);
    return toCurrency === BASE_CURRENCY
      ? amountInBase
      : amountInBase * (rates.rates[toCurrency] ?? 1);
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION_MS;
  }

  async forceRefresh(): Promise<ExchangeRates> {
    this.cachedRates = null;
    await storageService.set(CACHE_KEY, "");
    return this.getRates();
  }
}

export const exchangeRateService = new ExchangeRateService();