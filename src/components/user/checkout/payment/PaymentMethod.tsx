"use client";
import { CreditCard, Wallet, Clock } from "lucide-react";

type Props = {
  payment: string | null;
  openModal: (m: string) => void;
};

export default function PaymentMethod({ payment, openModal }: Props) {
  return (
    <div>
      <h3 className="text-white font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-yellow-400" />
        Payment Method
      </h3>

      <div className="grid gap-3">
        {/* Bank */}
        <button
          type="button"
          onClick={() => openModal("bank")}
          className={`flex items-center justify-between w-full p-4 rounded-2xl border transition group ${
            payment === "bank"
              ? "bg-gradient-to-r from-emerald-500/30 to-emerald-700/30 border-emerald-400 shadow-lg"
              : "bg-zinc-900/50 border-white/20 hover:border-yellow-400 hover:bg-zinc-800/50"
          }`}
        >
          <span className="flex items-center gap-2 text-white font-medium tracking-wide">
            <CreditCard className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition" />
            Bank Transfer
          </span>
          {payment === "bank" && (
            <span className="text-emerald-300 text-xs font-bold uppercase">
              Selected
            </span>
          )}
        </button>

        {/* E-Wallet */}
        <button
          type="button"
          onClick={() => openModal("ewallet")}
          className={`flex items-center justify-between w-full p-4 rounded-2xl border transition group ${
            payment === "ewallet"
              ? "bg-gradient-to-r from-emerald-500/30 to-emerald-700/30 border-emerald-400 shadow-lg"
              : "bg-zinc-900/50 border-white/20 hover:border-yellow-400 hover:bg-zinc-800/50"
          }`}
        >
          <span className="flex items-center gap-2 text-white font-medium tracking-wide">
            <Wallet className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition" />
            E-Wallet
          </span>
          {payment === "ewallet" && (
            <span className="text-emerald-300 text-xs font-bold uppercase">
              Selected
            </span>
          )}
        </button>

        {/* PayLater */}
        <button
          type="button"
          onClick={() => openModal("paylater")}
          className={`flex items-center justify-between w-full p-4 rounded-2xl border transition group ${
            payment === "paylater"
              ? "bg-gradient-to-r from-emerald-500/30 to-emerald-700/30 border-emerald-400 shadow-lg"
              : "bg-zinc-900/50 border-white/20 hover:border-yellow-400 hover:bg-zinc-800/50"
          }`}
        >
          <span className="flex items-center gap-2 text-white font-medium tracking-wide">
            <Clock className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition" />
            PayLater
          </span>
          {payment === "paylater" && (
            <span className="text-emerald-300 text-xs font-bold uppercase">
              Selected
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
