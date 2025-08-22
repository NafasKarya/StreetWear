"use client";

import React from "react";
import Modal from "./modals";

export type ShippingPolicyModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ShippingPolicyModal({ open, onClose }: ShippingPolicyModalProps) {
  const rules = [
    { title: "Respect the Drop", body: "No bots, no cheats. Play fair or get banned." },
    { title: "Product Description", body: "Pics are for reference, real product might have slight differences in color, size, or packaging." },
    { title: "Personal Use Only", body: "Our gear is for you, not for resale without our lawful approval. We can cancel orders we think are for commercial use." },
    { title: "We Can Move to Legal Action", body: "If you break these rules (like reselling without permission or copying our designs), we can take it to court or other legal steps." },
    {
      title: "Refunds",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>If item not shipped yet → refund in 14 days.</li>
          <li>If already shipped → refund in 14 days after we get it back.</li>
          <li>Refund via original payment method, no extra fee.</li>
          <li>Refund only if damage is from us or factory defect, <em>not</em> personal misuse.</li>
          <li>Item must be complete, in original condition, unused, with labels and packaging.</li>
          <li>Return shipping paid by buyer unless our fault.</li>
        </ul>
      )
    },
    { title: "Cancellations", body: "If we can’t deliver, we’ll tell you and refund what you’ve paid." },
    {
      title: "Losses",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>It’s something no one could predict.</li>
          <li>It’s caused by events outside our control.</li>
          <li>You could’ve avoided it by following care instructions.</li>
          <li>It’s a business loss.</li>
        </ul>
      )
    },
    { title: "Privacy", body: "Your data stays private. Check our (Vault Policies)." },
    { title: "Complaints", body: "Got a problem? Email us first so we can sort it." },
    { title: "Disputes", body: "Handled under Indonesian law. Courts in Indonesia will have the final say." },
    { title: "Transfer of Contract", body: "We can hand over your order to another company without hurting your rights. You can’t transfer to someone else without our OK." },
    { title: "Rule Survival", body: "If one part of these rules doesn’t count legally, the rest still apply. Delay in enforcing rules doesn’t mean we give up our rights." },
    { title: "Rule Changes", body: "We can update these rules anytime. If you keep buying after updates, that means you agree." },
    { title: "Intellectual Property", body: "All designs, logos, and content are ours. Don’t copy, use, or sell without permission." },
    { title: "Governed by Indonesian Law", body: "These rules follow Indonesian law. Disputes go to Indonesian courts." }
  ];

  return (
    <Modal open={open} onClose={onClose} title="Terms & Conditions">
      <div className="text-yellow-100 text-sm">
        {/* scroll hanya di body konten, bukan di panel modal */}
        <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2 custom-scroll">
          {rules.map((rule, i) => (
            <div
              key={i}
              className="rounded-xl border border-yellow-400/30 bg-neutral-900/70 p-4 hover:bg-neutral-900 transition"
            >
              <h4 className="font-semibold text-yellow-300 mb-1">
                {i + 1}. {rule.title}
              </h4>
              <div className="text-yellow-100/90">{rule.body}</div>
            </div>
          ))}
        </div>

        <p className="pt-6 text-center text-yellow-300">
          Talk to the Crew:{" "}
          <a href="mailto:fourteendency@gmail.com" className="underline">
            fourteendency@gmail.com
          </a>
        </p>
      </div>

      {/* Custom scrollbar styling */}
      <style>{`
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #facc15 #1a1a1a; /* thumb kuning, track hitam */
        }
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #facc15;
          border-radius: 8px;
          border: 2px solid #1a1a1a;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #fde047; /* lebih terang saat hover */
        }
      `}</style>
    </Modal>
  );
}
