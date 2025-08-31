// src/components/product/AccessCodeBox.tsx
"use client";

import React, { useState, useCallback } from "react";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

export type AccessCodeBoxProps = {
  onVerified?: () => void | Promise<void>;
};

export default function AccessCodeBox({ onVerified }: AccessCodeBoxProps) {
  const [accessInput, setAccessInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [verifyOk, setVerifyOk] = useState<boolean | null>(null);

  const submit = useCallback(async () => {
    setVerifyMsg(null);
    setVerifyOk(null);

    const code = accessInput.trim();
    if (!code) {
      setVerifyMsg("⚠️ kode wajib diisi");
      setVerifyOk(false);
      return;
    }

    setVerifying(true);
    setTimeout(async () => {
      if (code.toLowerCase().startsWith("acs_")) {
        setVerifyOk(true);
        setVerifyMsg("Access Granted");
        await onVerified?.();
      } else {
        setVerifyOk(false);
        setVerifyMsg("Invalid Access Code");
      }
      setVerifying(false);
    }, 900);
  }, [accessInput, onVerified]);

  return (
    <div className="mb-10 p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 to-black shadow-xl">
      <h4 className="text-xl font-extrabold tracking-wider uppercase text-white mb-5">
        Enter Access Code
      </h4>

      <div className="flex gap-3">
        <input
          value={accessInput}
          onChange={(e) => setAccessInput(e.target.value)}
          placeholder="acs_xxx..."
          className="flex-1 px-4 py-3 rounded-xl bg-black text-white border border-neutral-600 font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 placeholder-neutral-600"
          disabled={verifying}
        />
        <button
          onClick={submit}
          disabled={verifying || !accessInput.trim()}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-all
            ${
              verifying
                ? "bg-neutral-700 text-white cursor-wait opacity-100"
                : "bg-neutral-800 text-white hover:bg-neutral-600 active:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed"
            }
          `}
        >
          {verifying ? (
            <FiLoader className="animate-spin mx-auto" />
          ) : (
            "Verify"
          )}
        </button>
      </div>

      {verifyMsg && (
        <div
          className={`mt-4 flex items-center gap-2 text-sm font-semibold tracking-wide ${
            verifyOk ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {verifyOk ? <FiCheckCircle /> : <FiXCircle />}
          {verifyMsg}
        </div>
      )}
    </div>
  );
}
