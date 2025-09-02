"use client";

type Item = {
  id: number | string;
  name: string;
  price: number | string | null | undefined;
  size?: string | null;
  qty?: number | string | null;
  quantity?: number | string | null;
  // tambahin field lain kalau perlu
};

export default function CheckoutCartList({ items }: { items: Item[] }) {
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

  return (
    <div className="space-y-6">
      {items.map((item) => {
        // pastikan harga dan qty selalu number, anti NaN!
        const price = Number(item.price) || 0;
        // fallback ke quantity/qty, default 1 kalau null/undefined/empty
        const qty =
          Number(item.quantity) ||
          Number(item.qty) ||
          1;
        // ambil size, fallback ke "-"
        const size = item.size || "-";

        return (
          <div
            key={item.id}
            className="flex justify-between items-center border-b border-white/10 pb-4"
          >
            <div>
              <h2 className="text-white font-semibold text-lg">{item.name}</h2>
              <p className="text-sm text-gray-300">
                Size: {size} <br />
                Rp {formatRupiah(price)} x {qty}
              </p>
            </div>
            <span className="text-white font-bold text-lg">
              Rp {formatRupiah(price * qty)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
