'use client';
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Props = {
  onRegister: () => void;
  onSwitchToLogin: () => void;
};

const RegisterPage: React.FC<Props> = ({ onRegister, onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-extrabold text-black uppercase">REGISTER</h1>
        <p className="mt-2 text-lg text-black">Let's get you started!</p>

        <form
          className="mt-8 space-y-4"
          autoComplete="off"
          onSubmit={e => { e.preventDefault(); onRegister(); }}
        >
          <div>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-gray-300 focus:outline-none"
            />
          </div>

          <div>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-gray-300 focus:outline-none"
            />
          </div>

          {/* ACCESS CODE */}
          <div>
            <input
              id="access-code"
              type="text"
              placeholder="Access Code"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              autoComplete="off"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-gray-300 focus:outline-none"
            />
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-gray-300 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
              onClick={() => setShowPass(v => !v)}
              tabIndex={-1}
              aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              id="repeat-password"
              type={showRepeat ? "text" : "password"}
              placeholder="Ulangi Password"
              value={repeatPassword}
              onChange={e => setRepeatPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-gray-300 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
              onClick={() => setShowRepeat(v => !v)}
              tabIndex={-1}
              aria-label={showRepeat ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showRepeat ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="
              w-full py-3 bg-white text-black font-semibold rounded border-2 border-black
              transition-all duration-200 ease-in-out
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            REGISTER
          </button>
        </form>

        <p className="mt-6 text-sm text-black">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="underline font-semibold"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
