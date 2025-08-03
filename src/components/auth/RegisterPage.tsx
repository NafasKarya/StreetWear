'use client';
import React, { useState } from "react";
import { register } from "@/logic/authLocal";

type Props = {
  onRegister: () => void;
  onSwitchToLogin: () => void;
};

const RegisterPage: React.FC<Props> = ({ onRegister, onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!username || username.length < 3) {
        setError("Username minimal 3 karakter.");
        setLoading(false);
        return;
      }
      if (!email.includes("@")) {
        setError("Email tidak valid.");
        setLoading(false);
        return;
      }
      if (password.length < 4) {
        setError("Password minimal 4 karakter.");
        setLoading(false);
        return;
      }
      if (password !== repeatPassword) {
        setError("Password tidak sama.");
        setLoading(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 700));
      const res = register(username, email, password);
      if (!res.ok) {
        setError(res.msg);
        setLoading(false);
        return;
      }
      onRegister(); // LANGSUNG auto-login, panggil parent biar ke halaman home
    } catch (e) {
      setError("Register gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <main className="w-full max-w-md mx-auto flex flex-col items-center px-4">
        <h1 className="font-extrabold uppercase mb-2 text-center">REGISTER</h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
          {error && <div className="mb-3 text-red-500">{error}</div>}
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            autoComplete="username"
            required
          />
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
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
              autoComplete="new-password"
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
          <div className="relative">
            <input
              id="repeat-password"
              type={showRepeat ? "text" : "password"}
              placeholder="Ulangi Password"
              value={repeatPassword}
              onChange={e => setRepeatPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowRepeat(v => !v)}
              tabIndex={-1}
              disabled={loading}
            >
              {showRepeat ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "REGISTERING..." : "REGISTER"}
          </button>
        </form>
        <div className="mt-5 text-sm text-center">
          Sudah punya akun?{" "}
          <button type="button" onClick={onSwitchToLogin} className="underline font-semibold">
            Login
          </button>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
