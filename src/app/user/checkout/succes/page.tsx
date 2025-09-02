"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[url('/bg-streetwear.jpg')] bg-cover bg-center flex items-center justify-center p-6">
      <div className="glass-card max-w-lg w-full rounded-3xl p-10 text-center shadow-2xl">
        {/* Icon */}
        <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-400 mb-6 drop-shadow-lg" />

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-widest text-white mb-4">
          Payment Success
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 mb-8 text-sm md:text-base font-mono">
          Your order has been placed. You’ll receive confirmation and shipping
          updates soon. Stay tuned, your drip is on the way!
        </p>

        {/* Order detail box */}
        <div className="bg-zinc-900/60 border border-yellow-400/30 rounded-2xl p-5 mb-8 text-left">
          <p className="text-gray-400 text-xs tracking-wider mb-2">ORDER ID</p>
          <p className="text-white font-bold text-lg">#STWR123456</p>
          <p className="text-gray-400 text-xs tracking-wider mt-4 mb-2">ESTIMATED DELIVERY</p>
          <p className="text-yellow-400 font-semibold">2-4 Days</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/user/orders")}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold uppercase tracking-widest hover:opacity-90 transition shadow-lg"
          >
            View Orders
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-3 rounded-xl border border-white/30 text-white font-bold uppercase tracking-widest hover:border-yellow-400 hover:text-yellow-400 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
