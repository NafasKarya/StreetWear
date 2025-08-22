"use client";

import React from "react";
import Modal from "./modals";

export type TermsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function TermsModal({ open, onClose }: TermsModalProps) {
  const rules = [
    {
      title: "What We Take",
      body: "Just the basics: your name, phone, address, email, and payment info. No extra snooping."
    },
    {
      title: "Why We Need It",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ship your order fast.</li>
          <li>Hit you up if there’s an issue.</li>
          <li>Level up our service.</li>
          <li>Drop you promos (only if you’re down).</li>
        </ul>
      )
    },
    {
      title: "Keeping It Safe",
      body: "Your data’s stored tight, only our trusted crew can see it."
    },
    {
      title: "Who We Share With",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Couriers, so your package gets to you.</li>
          <li>Payment systems, to lock in the deal.</li>
          <li>Authorities if the law says so.</li>
          <li><em>Never sold to randoms. Ever.</em></li>
        </ul>
      )
    },
    {
      title: "Your Say",
      body: "Wanna see, change, or delete your info? Just holler at us."
    },
    {
      title: "Cookies",
      body: "Our site might use cookies to make your shopping smoother. Kill them in your browser if you want."
    },
    {
      title: "Changes",
      body: "If we tweak this policy, the latest version’s always on our site."
    }
  ];

  return (
    <Modal open={open} onClose={onClose} title="Vault Policies">
      <div className="text-yellow-100 text-sm">
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
          scrollbar-color: #facc15 #1a1a1a;
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
          background-color: #fde047;
        }
      `}</style>
    </Modal>
  );
}
