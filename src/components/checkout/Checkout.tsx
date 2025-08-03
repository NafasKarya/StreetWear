import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../cart/CartContext";

function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}
function parseHarga(str: string) {
  return parseInt(str.replace(/[^\d]/g, ""), 10) || 0;
}

const ONGKIR = 15000;

const Checkout: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { items } = useCart();
  const [voucher, setVoucher] = useState<string>("");
  const [nama, setNama] = useState<string>("");
  const [alamat, setAlamat] = useState<string>("");
  const router = useRouter();

  const itemTotals = items.map((item) => parseHarga(item.price) * item.qty);
  const subtotal = itemTotals.reduce((sum, n) => sum + n, 0);

  let diskon = 0;
  if (voucher.trim().toUpperCase() === "DISKON10") {
    diskon = Math.floor(subtotal * 0.1);
  }

  const total = subtotal - diskon + (items.length > 0 ? ONGKIR : 0);

  function handleBayar(e: React.FormEvent) {
    e.preventDefault();
    // Bisa passing data ke payment lewat context, url param, dsb.
    router.push("/payment");
  }

  return (
    <div className="bg-neutral-950 min-h-screen py-8 px-2 md:px-0 flex justify-center">
      <div className="w-full max-w-xl bg-neutral-900 text-white rounded-lg shadow-xl p-6">
        <div className="flex items-center mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-3 text-yellow-400 hover:text-white"
              aria-label="Kembali"
            >
              <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}
          <h2 className="text-2xl font-bold font-mono tracking-wide">
            Checkout
          </h2>
        </div>
        {items.length === 0 ? (
          <div className="text-center text-gray-400 mb-6">Keranjang kosong.</div>
        ) : (
          <div className="mb-6 space-y-5">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-neutral-800 pb-4">
                <img src={item.imageUrl} className="w-16 h-16 object-cover rounded" alt={item.name} />
                <div className="flex-1">
                  <div className="font-bold text-white text-md tracking-wide">{item.name}</div>
                  <div className="text-yellow-400 font-bold">{item.price}</div>
                  <div className="text-xs text-gray-400">Size: {item.size}</div>
                  <div className="text-xs text-gray-400 mt-1">Jumlah: <span className="text-white font-bold">{item.qty}</span></div>
                </div>
                <div className="font-mono text-right">
                  <span className="block text-xs text-gray-400">Subtotal</span>
                  <span className="text-lg font-bold text-yellow-400">{formatRupiah(parseHarga(item.price) * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleBayar}>
          <div>
            <label className="block text-sm mb-1">Nama Penerima</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-800 rounded border border-neutral-700 focus:border-yellow-400 text-white"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Alamat Pengiriman</label>
            <textarea
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-800 rounded border border-neutral-700 focus:border-yellow-400 text-white"
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Voucher</label>
            <input
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-800 rounded border border-neutral-700 focus:border-yellow-400 text-white"
              placeholder="Kode voucher (cth: DISKON10)"
            />
            {diskon > 0 && (
              <div className="text-green-400 mt-1 text-xs">Voucher diskon {formatRupiah(diskon)}</div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Ongkos Kirim</label>
            <input
              type="number"
              value={ONGKIR}
              readOnly
              disabled
              className="w-full px-4 py-2 bg-neutral-700 rounded border border-neutral-700 text-white opacity-60 cursor-not-allowed"
              placeholder="Ongkir"
            />
            <div className="text-xs text-yellow-400 mt-1">Ongkir tetap {formatRupiah(ONGKIR)}</div>
          </div>
          <div className="mt-6 mb-3 rounded-lg bg-neutral-800 p-4">
            <div className="flex justify-between text-base mb-2">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {diskon > 0 && (
              <div className="flex justify-between text-base mb-2 text-green-400">
                <span>Diskon</span>
                <span>-{formatRupiah(diskon)}</span>
              </div>
            )}
            <div className="flex justify-between text-base mb-2">
              <span>Ongkir</span>
              <span>{items.length > 0 ? formatRupiah(ONGKIR) : "-"}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t border-neutral-700 pt-3 mt-2">
              <span>Total</span>
              <span className="text-yellow-400">{formatRupiah(total)}</span>
            </div>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold text-base hover:bg-yellow-300 transition-colors"
            disabled={items.length === 0 || !nama || !alamat}
            type="submit"
          >
            Bayar Sekarang
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
