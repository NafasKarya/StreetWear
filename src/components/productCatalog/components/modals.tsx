// Modal.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  if (!open) return null;

  const content = (
    <div
      ref={backdropRef}
      onClick={onBackdropClick}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-yellow-400/30 bg-neutral-950 text-yellow-50 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-400/20 shrink-0">
          <h3 className="text-lg font-bold tracking-wide">{title ?? "Modal"}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-3 py-1 text-yellow-300 hover:text-black hover:bg-yellow-400 transition"
          >
            ✕
          </button>
        </div>

        {/* Body (scroll hanya di sini) */}
        <div className="px-5 py-4 text-sm leading-relaxed overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof window !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}
