// src/app/admins/upload/constants.ts
import type { CurrencyCode } from "./types";

export const CURRENCY_OPTIONS: Array<{ code: CurrencyCode; label: string; hint: string }> = [
  { code: "IDR", label: "Rp – Indonesian Rupiah", hint: "Rp" },
  { code: "USD", label: "USD – US Dollar", hint: "$" },
  { code: "MYR", label: "MYR – Ringgit Malaysia", hint: "RM" },
  { code: "SGD", label: "SGD – Singapore Dollar", hint: "S$" },
];
