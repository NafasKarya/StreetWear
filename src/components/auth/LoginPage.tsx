'use client';
import React, { useState } from "react";
import { login } from "@/logic/authLocal";

type Props = {
  onLogin: () => void;
  onSwitchToRegister: () => void;
};

const LoginPage: React.FC<Props> = ({ onLogin, onSwitchToRegister }) => {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!credential || password.length < 4) {
        setError("Email/username dan password wajib diisi.");
        setLoading(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 700));
      const res = login(credential, password);
      if (!res.ok) {
        setError(res.msg);
        setLoading(false);
        return;
      }
      onLogin(); // PENTING! Panggil parent supaya halaman pindah
    } catch (e) {
      setError("Login gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <main className="w-full max-w-md mx-auto flex flex-col items-center px-4">
        <h1 className="font-extrabold uppercase mb-2 text-center">LOG IN</h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
          {error && <div className="mb-3 text-red-500">{error}</div>}
          <input
            id="credential"
            type="text"
            placeholder="Username atau Email"
            value={credential}
            onChange={e => setCredential(e.target.value)}
            disabled={loading}
            autoComplete="username"
            required
          />
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPass(v => !v)}
              tabIndex={-1}
              disabled={loading}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>
        <div className="mt-5 text-sm text-center">
          Belum punya akun?{" "}
          <button type="button" onClick={onSwitchToRegister} className="underline font-semibold">
            Register
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
