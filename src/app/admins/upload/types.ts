// src/app/admins/upload/types.ts
export type CurrencyCode = "IDR" | "USD" | "MYR" | "SGD";

export interface SizeRow {
  label: string;
  stock: number;
  price: number;
  currency: CurrencyCode;
}
