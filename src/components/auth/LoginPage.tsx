'use client';
import React, { useState } from 'react';
import dynamic from "next/dynamic";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

type Props = {
  onLogin: () => void;
  onSwitchToRegister: () => void;
};

// Dynamic import supaya <video> cuma render di client, ga ikut SSR
const VideoBackground = dynamic(() => import('@/components/auth/VideoBackground'), { ssr: false });

const LoginPage: React.FC<Props> = ({ onLogin, onSwitchToRegister }) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* VIDEO BACKGROUND - Client only */}
      <VideoBackground />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* FORM */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-extrabold text-white uppercase">LOG IN</h1>
          <p className="mt-2 text-lg text-white">Welcome To Fourteendency</p>

          <form className="mt-8 space-y-4" autoComplete="off" onSubmit={e => e.preventDefault()}>
            <div>
              <input
                id="credential"
                type="text"
                placeholder="Email atau username"
                value={credential}
                onChange={e => setCredential(e.target.value)}
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded bg-white placeholder-black text-black focus:outline-none"
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
                className="w-full px-4 py-3 rounded bg-white placeholder-black text-black focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
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
                Forgot password?
              </button>
            </div>

<button
  type="button"
  className="
    w-full py-3 bg-black text-white font-semibold rounded 
    transition-all duration-200 ease-in-out
    hover:bg-white hover:text-black
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
    disabled:opacity-70 disabled:cursor-not-allowed
  "
  onClick={onLogin}
>
  LOG IN
</button>


          </form>

          <p className="mt-6 text-sm text-white">
            Don't have an account yet?{' '}
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
