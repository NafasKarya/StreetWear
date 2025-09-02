"use client";
import React, { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { useAccessCodeAdminStore } from "@/store/admin/auth/useAccessCodeAdminStore";

export default function AccessCodeBox() {
  const [accessCode, setAccessCode] = useState("");
  const {
    loading: accessCodeLoading,
    error: accessCodeError,
    data: accessCodeData,
    createAccessCode,
    reset,
  } = useAccessCodeAdminStore();

  const handleCreateAccessCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // token sekarang diambil langsung dari store, argumen opsional
    await createAccessCode({ code: accessCode });
    setAccessCode("");
    setTimeout(() => reset(), 3000); // Reset sukses/error msg auto
  };

  return (
    <section className="mb-12">
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-md">
        <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest mb-4">
          <KeyRound className="h-5 w-5 text-emerald-300" /> Create Access Code
        </h2>
        <form
          onSubmit={handleCreateAccessCode}
          className="flex flex-col sm:flex-row gap-4"
        >
          <input
            type="text"
            placeholder="Enter new access code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-zinc-400"
            disabled={accessCodeLoading}
          />
          <button
            type="submit"
            disabled={accessCodeLoading}
            className="px-6 py-3 font-semibold uppercase tracking-widest text-sm rounded-xl border border-emerald-400/30 bg-transparent text-emerald-300 hover:bg-emerald-400/10"
          >
            {accessCodeLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Creating...
              </span>
            ) : (
              "Create"
            )}
          </button>
        </form>
        {accessCodeError && (
          <p className="mt-2 text-sm text-red-400">{accessCodeError}</p>
        )}
        {accessCodeData && (
          <p className="mt-2 text-sm text-emerald-300">
            Access Code <b>{accessCodeData.code}</b> berhasil dibuat!
          </p>
        )}
      </div>
    </section>
  );
}
