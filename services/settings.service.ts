import { storageService } from "./storage.service";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "MGA", name: "Ariary", symbol: "Ar" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
];

const SETTINGS_KEY = "app_settings";

export interface AppSettings {
  currency: string;
  biometricLogin: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: "USD",
  biometricLogin: false,
};

class SettingsService {
  private settings: AppSettings = DEFAULT_SETTINGS;
  private initialized: boolean = false;

  async initialize(): Promise<AppSettings> {
    if (this.initialized) return this.settings;
    
    try {
      const stored = await storageService.get(SETTINGS_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      this.initialized = true;
    } catch (error) {
      console.error("Error loading settings:", error);
    }
    return this.settings;
  }

  async setSettings(settings: Partial<AppSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    try {
      await storageService.set(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  getSettings(): AppSettings {
    return this.settings;
  }

  getCurrency(): Currency {
    return CURRENCIES.find(c => c.code === this.settings.currency) || CURRENCIES[0];
  }

  formatAmount(amount: number, currencyCode?: string): string {
    const currency = CURRENCIES.find(c => c.code === (currencyCode || this.settings.currency)) || CURRENCIES[0];
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
    }).format(amount);
  }
}

export const settingsService = new SettingsService();
