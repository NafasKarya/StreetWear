'use client';
import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/logic/authLocal';

type Props = {
  onLogin: () => void;
  onSwitchToRegister: () => void;
};

const LoginPage: React.FC<Props> = ({ onLogin, onSwitchToRegister }) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [asAdmin, setAsAdmin] = useState(false); // <- toggle paksa admin
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = useMemo(() => sp.get('next') || '/', [sp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);
    try {
      if (!credential || password.length < 4) {
        setError('Email/username dan password wajib diisi.');
        return;
      }

      await new Promise((r) => setTimeout(r, 200)); // biar ada feedback dikit

      // NEW: kalau asAdmin=true → paksa jalur admin, kalau false → coba user dulu, lalu admin.
      const res = await login(credential, password, asAdmin);
      if (!res.ok) {
        setError(res.msg || 'Login gagal');
        return;
      }

      // Kalau kamu mau handle redirect di sini:
      // router.replace(nextUrl); router.refresh();

      // Atau biar konsisten sama parent (AuthScreen) kamu:
      onLogin();
    } catch {
      setError('Login gagal, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-center bg-cover"
      style={{ backgroundImage: "url('/assets/login-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-extrabold text-white uppercase">LOG IN</h1>
          <p className="mt-2 text-lg text-gray-300">Welcome back, bestie!</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit} autoComplete="off">
            {error && <p className="text-red-500">{error}</p>}

            <div>
              <input
                id="credential"
                type="text"
                placeholder="Email atau username"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                disabled={loading}
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded bg-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded bg-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
                disabled={loading}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Toggle paksa admin (opsional) */}
            <label className="flex items-center gap-2 text-left text-gray-200 text-sm">
              <input
                type="checkbox"
                checked={asAdmin}
                onChange={(e) => setAsAdmin(e.target.checked)}
                disabled={loading}
              />
              Login sebagai admin
            </label>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-200 underline"
                onClick={() => { /* TODO: forgot password */ }}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-semibold rounded hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-200">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="underline font-semibold"
              disabled={loading}
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
