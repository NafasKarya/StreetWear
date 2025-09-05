'use client';
import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLoginAdminStore } from '@/store/admin/auth/useLoginAdminStore';

const LoginAdminPage: React.FC = () => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const router = useRouter();
  const { login, loading, error, success, reset } = useLoginAdminStore();

  // Reset error if user edits input
  useEffect(() => {
    if (error && (credential || password)) {
      reset();
    }
    // eslint-disable-next-line
  }, [credential, password]);

  // Redirect if success
  useEffect(() => {
    if (success) {
      router.push("/admins/dashboard");
    }
  }, [success, router]);

  // Show logout success modal
  useEffect(() => {
    if (localStorage.getItem("logoutSuccess") === "true") {
      setShowLogoutModal(true);
      localStorage.removeItem("logoutSuccess");
      const timer = setTimeout(() => setShowLogoutModal(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ credential, password });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/assets/images/splash.jpg" // ganti path sesuai image lo di /public
        alt="Admin Background"
        fill
        priority
        className="object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-extrabold text-white uppercase">ADMIN LOGIN</h1>
          <p className="mt-2 text-lg text-white">Login Akun Admin</p>

          {/* Logout success modal */}
          {showLogoutModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white/90 backdrop-blur-md text-black rounded-xl shadow-lg px-8 py-6 animate-fadeIn">
                <p className="text-lg font-semibold">Logout berhasil ✅</p>
                <p className="text-sm text-gray-600">Anda akan masuk kembali dengan akun lain.</p>
              </div>
            </div>
          )}

          <form
            className="mt-8 space-y-4"
            autoComplete="off"
            onSubmit={handleLogin}
          >
            <div>
              <input
                id="credential"
                type="text"
                placeholder="Email"
                value={credential}
                onChange={e => setCredential(e.target.value)}
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-black focus:outline-none"
              />
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-black focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-white underline"
                onClick={() => {}}
              >
                Lupa password?
              </button>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}
            {success && (
              <div className="text-green-400 text-sm">Login berhasil!</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 bg-black text-white font-semibold rounded
                transition-all duration-200 ease-in-out
                hover:bg-white hover:text-black
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed
              "
            >
              {loading ? "Logging in..." : "LOG IN"}
            </button>
          </form>

          <p className="mt-6 text-sm text-white">
            Belum punya akun admin?{' '}
            <button
              type="button"
              onClick={() => router.push("/admins/auth/register")}
              className="underline font-semibold"
            >
              Daftar admin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdminPage;
