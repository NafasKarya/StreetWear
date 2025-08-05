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
    <div
      className="relative min-h-screen bg-center bg-cover"
      style={{ backgroundImage: "url('/assets/login-bg.jpg')" }}
    >
      {/* overlay gelap */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-extrabold text-white uppercase">LOG IN</h1>
          <p className="mt-2 text-lg text-gray-300">Welcome back, bestie!</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {error && <p className="text-red-500">{error}</p>}

            <div>
              <input
                id="credential"
                type="text"
                placeholder="Your email"
                value={credential}
                onChange={e => setCredential(e.target.value)}
                disabled={loading}
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded bg-white placeholder-gray-500 focus:outline-none"
              />
            </div>

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
                className="w-full px-4 py-3 rounded bg-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                disabled={loading}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-200 underline"
                onClick={() => { /* panggil modal/lupa password */ }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-semibold rounded hover:bg-gray-800"
            >
              {loading ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-200">
            Don't have an account yet?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="underline font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
