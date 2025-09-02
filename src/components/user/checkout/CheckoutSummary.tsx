"use client";

export default function CheckoutSummary({
  subtotal,
  shippingCost,
  shippingEstimate,
  courier,
  service,
  grandTotal,
}: {
  subtotal: number;
  shippingCost: number;
  shippingEstimate: string;
  courier: string | null;
  service: string | null;
  grandTotal: number;
}) {
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

  return (
    <>
      <div className="flex justify-between items-center mt-8 text-lg">
        <span className="text-gray-300 font-medium">Subtotal</span>
        <span className="text-yellow-300 font-bold text-xl">
          Rp {formatRupiah(subtotal)}
        </span>
      </div>

      <div className="flex justify-between items-center mt-2 text-lg">
        <div className="flex flex-col">
          <span className="text-gray-300 font-medium">
            Shipping {courier && service ? `- ${courier} (${service})` : ""}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            Estimasi: {shippingEstimate}
          </span>
        </div>
        <span className="text-yellow-300 font-bold text-xl">
          Rp {formatRupiah(shippingCost)}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4 text-lg border-t border-white/10 pt-4">
        <span className="text-gray-100 font-bold uppercase tracking-wide">
          Total
        </span>
        <span className="text-emerald-400 font-extrabold text-2xl">
          Rp {formatRupiah(grandTotal)}
        </span>
      </div>
    </>
  );
}
