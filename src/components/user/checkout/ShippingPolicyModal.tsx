"use client";

import { X } from "lucide-react";

interface ShippingPolicyModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ShippingPolicyModal({ show, onClose }: ShippingPolicyModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-zinc-900/90 text-white rounded-2xl max-w-3xl w-full max-h-[85vh] p-6 shadow-lg border border-white/20 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold uppercase tracking-widest text-yellow-400">
            Vault Policies
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Intro */}
        <p className="italic text-yellow-300 mb-6">
          We got you — your privacy stays locked with us. By copping from our store, you’re cool with this policy.
        </p>

        {/* Content */}
        <div className="space-y-6 text-sm leading-relaxed text-gray-300">
          <div>
            <h3 className="font-semibold text-white">1. What We Take</h3>
            <p>Just the basics: your name, phone, address, email, and payment info. No extra snooping.</p>
          </div>

          <div>
            <h3 className="font-semibold text-white">2. Why We Need It</h3>
            <ul className="list-disc list-inside ml-5 mt-2 space-y-1 marker:text-zinc-400">
              <li>Ship your order fast.</li>
              <li>Hit you up if there’s an issue.</li>
              <li>Level up our service.</li>
              <li>Drop you promos (only if you’re down).</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">3. Keeping It Safe</h3>
            <p>Your data’s stored tight, only our trusted crew can see it.</p>
          </div>

          <div>
            <h3 className="font-semibold text-white">4. Who We Share With</h3>
            <ul className="list-disc list-inside ml-5 mt-2 space-y-1 marker:text-zinc-400">
              <li>Couriers, so your package gets to you.</li>
              <li>Payment systems, to lock in the deal.</li>
              <li>Authorities if the law says so.</li>
            </ul>
            <p className="mt-2 text-red-400">Never sold to randoms. Ever.</p>
          </div>

          <div>
            <h3 className="font-semibold text-white">5. Your Say</h3>
            <p>Wanna see, change, or delete your info? Just holler at us.</p>
          </div>

          <div>
            <h3 className="font-semibold text-white">6. Cookies</h3>
            <p>Our site might use cookies to make your shopping smoother. Kill them in your browser if you want.</p>
          </div>

          <div>
            <h3 className="font-semibold text-white">7. Changes</h3>
            <p>If we tweak this policy, the latest version’s always on our site.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
