"use client";
import React, { useState } from "react";
import { KeyRound, Loader2, RefreshCcw, Clock4, Trash2 } from "lucide-react";
import { useAccessCodeAdminStore } from "@/store/admin/auth/useAccessCodeAdminStore";
import { useUpdatedCodeAdmin } from "@/store/admin/auth/useUpdatedCodeAdmin";
import { useExtendCodeAdminStore } from "@/store/admin/auth/useExtendCodeAdminStore";
import { useDeleteCodeAdminStore } from "@/store/admin/auth/useDeleteCodeAdminStore"; // <-- import store delete

export default function AccessCodeBox() {
  // CREATE state
  const [accessCode, setAccessCode] = useState("");
  const {
    loading: accessCodeLoading,
    error: accessCodeError,
    data: accessCodeData,
    createAccessCode,
    reset: resetCreate,
  } = useAccessCodeAdminStore();

  // UPDATE state
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const {
    loading: updateLoading,
    error: updateError,
    data: updateData,
    success: updateSuccess,
    updateAccessCode,
    reset: resetUpdate,
  } = useUpdatedCodeAdmin();

  // EXTEND state
  const [extendCode, setExtendCode] = useState("");
  const [extendDateTime, setExtendDateTime] = useState("");
  const {
    loading: extendLoading,
    error: extendError,
    success: extendSuccess,
    data: extendData,
    extendAccessCode,
    reset: resetExtend,
  } = useExtendCodeAdminStore();

  // DELETE state
  const [deleteCode, setDeleteCode] = useState(""); // kode yg mau dihapus
  const {
    loading: deleteLoading,
    error: deleteError,
    success: deleteSuccess,
    data: deleteData,
    deleteAccessCode,
    reset: resetDelete,
  } = useDeleteCodeAdminStore();

  // CREATE handler
  const handleCreateAccessCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createAccessCode({ code: accessCode });
    setAccessCode("");
    setTimeout(() => resetCreate(), 3000);
  };

  // UPDATE handler
  const handleUpdateAccessCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!oldCode || !newCode) return;
    await updateAccessCode({
      old_code: oldCode,
      new_code: newCode,
    });
    setOldCode("");
    setNewCode("");
    setTimeout(() => resetUpdate(), 3000);
  };

  // EXTEND handler
  const handleExtendAccessCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!extendCode || !extendDateTime) return;
    await extendAccessCode({
      code: extendCode,
      expired_at: extendDateTime,
    });
    setExtendCode("");
    setExtendDateTime("");
    setTimeout(() => resetExtend(), 3000);
  };

  // DELETE handler
  const handleDeleteAccessCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deleteCode) return;
    await deleteAccessCode({ code: deleteCode });
    setDeleteCode("");
    setTimeout(() => resetDelete(), 3000);
  };

  return (
    <section className="mb-12">
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-md">
        {/* CREATE */}
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

        {/* UPDATE */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest mb-4">
            <RefreshCcw className="h-5 w-5 text-yellow-300" /> Update Access Code
          </h2>
          <form
            onSubmit={handleUpdateAccessCode}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Kode Lama"
              value={oldCode}
              onChange={(e) => setOldCode(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-zinc-400"
              disabled={updateLoading}
            />
            <input
              type="text"
              placeholder="Kode Baru"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-zinc-400"
              disabled={updateLoading}
            />
            <button
              type="submit"
              disabled={updateLoading}
              className="px-6 py-3 font-semibold uppercase tracking-widest text-sm rounded-xl border border-yellow-400/30 bg-transparent text-yellow-300 hover:bg-yellow-400/10"
            >
              {updateLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                </span>
              ) : (
                "Update"
              )}
            </button>
          </form>
          {updateError && (
            <p className="mt-2 text-sm text-red-400">{updateError}</p>
          )}
          {updateSuccess && (
            <p className="mt-2 text-sm text-yellow-300">{updateSuccess}</p>
          )}
          {updateData && (
            <p className="mt-2 text-sm text-yellow-200">
              Access Code <b>{updateData.code}</b> berhasil diupdate!
            </p>
          )}
        </div>

        {/* EXTEND */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest mb-4">
            <Clock4 className="h-5 w-5 text-blue-300" /> Extend Access Code
          </h2>
          <form
            onSubmit={handleExtendAccessCode}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Kode Access Code"
              value={extendCode}
              onChange={(e) => setExtendCode(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-zinc-400"
              disabled={extendLoading}
            />
            <input
              type="datetime-local"
              placeholder="Tanggal & Jam Expired"
              value={extendDateTime}
              onChange={(e) => setExtendDateTime(e.target.value)}
              required
              className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-zinc-400"
              disabled={extendLoading}
              style={{ minWidth: 200 }}
            />
            <button
              type="submit"
              disabled={extendLoading}
              className="px-6 py-3 font-semibold uppercase tracking-widest text-sm rounded-xl border border-blue-400/30 bg-transparent text-blue-300 hover:bg-blue-400/10"
            >
              {extendLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Extending...
                </span>
              ) : (
                "Extend"
              )}
            </button>
          </form>
          {extendError && (
            <p className="mt-2 text-sm text-red-400">{extendError}</p>
          )}
          {extendSuccess && (
            <p className="mt-2 text-sm text-blue-300">{extendSuccess}</p>
          )}
          {extendData?.expired_at_wib && (
            <p className="mt-2 text-sm text-blue-200">
              Expired diperpanjang sampai <b>{extendData.expired_at_wib}</b>
            </p>
          )}
        </div>

        {/* DELETE */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest mb-4">
            <Trash2 className="h-5 w-5 text-red-400" /> Delete Access Code
          </h2>
          <form
            onSubmit={handleDeleteAccessCode}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Kode Access Code yang mau dihapus"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-zinc-400"
              disabled={deleteLoading}
            />
            <button
              type="submit"
              disabled={deleteLoading}
              className="px-6 py-3 font-semibold uppercase tracking-widest text-sm rounded-xl border border-red-400/30 bg-transparent text-red-400 hover:bg-red-400/10"
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </form>
          {deleteError && (
            <p className="mt-2 text-sm text-red-400">{deleteError}</p>
          )}
          {deleteSuccess && (
            <p className="mt-2 text-sm text-red-400">{deleteSuccess}</p>
          )}
          {deleteData && (
            <p className="mt-2 text-sm text-red-200">
              Access Code <b>{deleteCode}</b> berhasil dihapus!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
