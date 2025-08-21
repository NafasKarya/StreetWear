export type Currency = "IDR" | "USD" | "MYR" | "SGD";

/** Terima variasi penulisan & alias "USGD" -> "SGD" */
export function normalizeCurrency(input?: string | null): Currency {
  const v = String(input ?? "").trim().toUpperCase();
  if (v === "IDR" || v === "RP") return "IDR";
  if (v === "USD" || v === "$" || v === "US$") return "USD";
  if (v === "MYR" || v === "RM" || v === "RINGGIT" || v === "RINGIT") return "MYR";
  if (v === "SGD" || v === "S$" || v === "USGD") return "SGD";
  return "IDR";
}

export function formatMoney(amount: number, currency: Currency): string {
  const n = Number.isFinite(amount) ? amount : 0;
  switch (currency) {
    case "USD":
      return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "MYR":
      return `RM${n.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "SGD":
      return `S$${n.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      // IDR
      return `Rp${Math.round(n).toLocaleString("id-ID")}`;
  }
}

/** Siap pakai untuk mapping sizes[] pada response */
export function mapSizesForOut(raw: any[] | undefined | null) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((s) => {
    const currency = normalizeCurrency(s?.currency);
    const price = Number(s?.price ?? 0);
    return {
      ...s,
      currency,
      price,
      priceFormatted: formatMoney(price, currency),
    };
  });
}
