'use client';
import { useRegisterStore } from "@/store/admin/auth/useRegisterStore";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";

const RegisterAdminPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  const { register, loading, error, success, reset } = useRegisterStore();
  const router = useRouter();

  React.useEffect(() => {
    reset();
    // eslint-disable-next-line
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      alert("Password tidak cocok.");
      return;
    }
    await register({
      username,
      email,
      password,
      password_confirmation: repeatPassword,
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-extrabold text-black uppercase">REGISTER ADMIN</h1>
        <p className="mt-2 text-lg text-black">Buat akun admin baru!</p>

        <form
          className="mt-8 space-y-4"
          autoComplete="off"
          onSubmit={handleRegister}
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

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm">
              Admin berhasil terdaftar!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 bg-white text-black font-semibold rounded border-2 border-black
              transition-all duration-200 ease-in-out
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {loading ? "Registering..." : "REGISTER"}
          </button>
        </form>

        <p className="mt-6 text-sm text-black">
          Sudah punya akun admin?{" "}
          <button
            type="button"
            onClick={() => router.push("/admins/auth/login")}
            className="underline font-semibold"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterAdminPage;
