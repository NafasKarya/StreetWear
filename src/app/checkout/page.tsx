"use client";

import React, { useMemo, useState } from "react";
import { useCart } from "../../components/cart/CartContext";
import { useRouter } from "next/navigation";

function parseHarga(str: string) {
  return parseInt(String(str || "").replace(/[^\d]/g, ""), 10) || 0;
}
function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const totals = useMemo(() => {
    const qty = items.reduce((s, it) => s + it.qty, 0);
    const amount = items.reduce((s, it) => s + parseHarga(it.price) * it.qty, 0);
    return { qty, amount };
  }, [items]);

  const submitCheckout = async () => {
    if (items.length === 0) {
      setMsg("Keranjang kosong.");
      return;
    }
    setLoading(true);
    setMsg(null);

    try {
      const payload = {
        items: items.map((it) => ({
          productId: it.id,
          sizeLabel: it.size,
          qty: it.qty,
        })),
        note: note.trim() || undefined,
      };

      // Optional idempotency key
      const idem =
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `idem_${Math.random().toString(36).slice(2)}_${Date.now()}`);

      const res = await fetch("/api/admin/products/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idem,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "Checkout gagal");
      }

      setOrderRef(json.data?.orderRef || null);
      setMsg("Checkout berhasil. Mantap.");
      // (opsional) arahkan ke halaman sukses khusus
      // router.push(`/checkout/success?ref=${encodeURIComponent(json.data.orderRef)}`);
    } catch (e: any) {
      setMsg(e?.message || "Checkout gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
          <button
            className="underline hover:text-white"
            onClick={() => router.back()}
          >
            &larr; Back
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-neutral-900 text-white p-6 rounded border border-yellow-400/40">
            Keranjang kosong. Cari barang dulu ya.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ringkasan item */}
            <div className="md:col-span-2 space-y-4">
              {items.map((it, idx) => (
                <div
                  key={`${it.id}-${it.size}-${idx}`}
                  className="flex gap-4 p-4 bg-neutral-900 rounded border border-neutral-700"
                >
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-white">{it.name}</div>
                    <div className="text-sm text-yellow-300">Size: {it.size}</div>
                    <div className="text-sm text-gray-300">Qty: {it.qty}</div>
                  </div>
                  <div className="font-bold text-yellow-400">
                    {formatRupiah(parseHarga(it.price) * it.qty)}
                  </div>
                </div>
              ))}

              <div className="p-4 bg-neutral-900 rounded border border-neutral-700">
                <label className="block text-sm text-yellow-300 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 rounded bg-neutral-800 text-white outline-none border border-neutral-700 focus:border-yellow-400"
                  rows={3}
                  placeholder="Contoh: kirim cepat ya..."
                />
              </div>
            </div>

            {/* Total & action */}
            <div className="space-y-4">
              <div className="p-4 bg-neutral-900 rounded border border-neutral-700">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-300">Total Item</span>
                  <span className="font-bold">{totals.qty}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-yellow-300">Total Harga</span>
                  <span className="font-extrabold text-xl">
                    {formatRupiah(totals.amount)}
                  </span>
                </div>
              </div>

              <button
                onClick={submitCheckout}
                disabled={loading || items.length === 0}
                className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold text-base hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Buat Checkout"}
              </button>

              {msg && (
                <div className="p-3 rounded border border-yellow-400/40 bg-neutral-900 text-white">
                  {msg}
                  {orderRef && (
                    <div className="text-yellow-300 mt-1 text-sm">
                      Order Ref: <span className="font-mono">{orderRef}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-yellow-400/70 pt-8 mt-8 border-t border-yellow-400/50">
          <p>Copyright © 2023, CRTZW</p>
        </footer>
      </div>
    </div>
  );
}
