"use client";
import React from "react";
import { useRouter } from "next/navigation";

const SHOPEEPAY_QR = "https://cdn.shopify.com/s/files/1/0661/9630/7112/files/sample-shopeepay-qr.png?v=1686720106";

const Payment: React.FC = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-neutral-950 flex justify-center items-center">
      <div className="bg-neutral-900 p-8 rounded-xl shadow-lg w-full max-w-md text-white flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-5 font-mono tracking-wide">Pembayaran ShopeePay</h2>
        <img src={SHOPEEPAY_QR} alt="QR ShopeePay" className="w-64 h-64 mb-4 rounded bg-white" />
        <div className="mb-4 text-center text-yellow-400 text-base font-semibold">
          Scan QR di atas pakai aplikasi ShopeePay kamu untuk menyelesaikan pembayaran.
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-6 py-2 px-6 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors"
        >
          Kembali ke Home
        </button>
      </div>
    </div>
  );
};

export default Payment;
