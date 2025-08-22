"use client";

import React from "react";
import Modal from "./modals";


export type NewsletterModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewsletterModal({ open, onClose }: NewsletterModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Newsletter">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") || "").trim();
          if (!email) return;
          alert(`Thanks! Subscribed: ${email}`);
          onClose();
        }}
      >
        <p className="text-yellow-200">
          Dapetin drop, diskon, dan update via email. No spam, janji.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl bg-neutral-900 border border-yellow-400/30 px-4 py-3 text-yellow-50 placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="submit"
            className="rounded-xl border-2 border-yellow-400 px-4 py-3 font-bold text-yellow-300 hover:bg-yellow-400 hover:text-black transition"
          >
            JOIN
          </button>
        </div>
        <p className="text-xs text-yellow-300/70">
          Dengan submit, kamu setuju sama kebijakan privasi kami.
        </p>
      </form>
    </Modal>
  );
}
