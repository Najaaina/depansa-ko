import { useCurrency } from "@/context/CurrencyContext";

export function useConvertedAmounts(amountsInMGA: number[]): string[] {
  const { convertAndFormat } = useCurrency();
  return amountsInMGA.map(convertAndFormat);
}

export function useCurrencyFormatter() {
  const { convertAndFormat, convert, formatAmount, currency, ratesLoaded } =
    useCurrency();
  return { convertAndFormat, convert, formatAmount, currency, ratesLoaded };
}