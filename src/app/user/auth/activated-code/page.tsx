'use client';

import { useUserActivateCode } from '@/store/user/auth/useUserActivateCode';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivateCodePage() {
  const [code, setCode] = useState('');
  const { activateCode, isLoading, error, isSuccess, message } = useUserActivateCode();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    await activateCode(code);
  };

  // === Redirect otomatis ke dashboard kalau sukses ===
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/user/dashboard');
      }, 900); // delay biar user liat pesan success bentar
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Glass container */}
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-8">
        <h1 className="text-2xl font-extrabold text-center mb-6 text-white tracking-widest uppercase">
          Enter Access Code
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Access Code"
            className="w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#01AA13] focus:border-[#01AA13] text-base"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading || isSuccess}
            autoFocus
          />
          {error && (
            <div className="w-full px-4 py-2 bg-red-600/30 border border-red-500 text-red-400 rounded-lg text-sm text-center font-semibold">
              {error}
            </div>
          )}
          {isSuccess && (
            <div className="w-full px-4 py-2 bg-[#01AA13]/30 border border-[#01AA13] text-[#01AA13] rounded-lg text-sm text-center font-semibold">
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full py-3 rounded-xl bg-[#01AA13] hover:bg-[#018c10] text-white font-extrabold uppercase tracking-widest text-base transition-all disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking...' : 'Activate'}
          </button>
        </form>
      </div>
    </div>
  );
}
