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
      onRegister();
    } catch {
      setError("Register gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-center bg-cover"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1569470451072-68314f596aec?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-extrabold text-white uppercase">REGISTER</h1>
          <p className="mt-2 text-lg text-gray-300">Let's get you started!</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {error && <p className="text-red-500">{error}</p>}

            <div>
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded bg-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
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
                autoComplete="new-password"
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
                className="w-full px-4 py-3 rounded bg-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
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
              className="w-full py-3 bg-black text-white font-semibold rounded hover:bg-gray-800"
            >
              {loading ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-200">
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
    </div>
  );
};

export default RegisterPage;
