'use client';
import React, { useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserRegisterStore } from "@/store/user/auth/useUserRegisterStore";

const RegisterUserPage: React.FC = () => {
  const [showPass, setShowPass] = React.useState(false);
  const [showRepeat, setShowRepeat] = React.useState(false);
  const router = useRouter();

  const { isLoading, error, isSuccess, registerUser } = useUserRegisterStore();

  // === GANTI KE CODE REF ===
  const codeRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const repeatPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = codeRef.current?.value || "";
    const name = usernameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const password_confirmation = repeatPasswordRef.current?.value || "";

    if (password !== password_confirmation) {
      alert("Password dan Repeat Password harus sama!");
      return;
    }

    await registerUser({
      code,
      name,
      email,
      password,
      password_confirmation,
    });

    if (isSuccess) {
      setTimeout(() => router.push("/user/auth/login"), 1200);
    }
  };

  const handleLoginClick = () => {
    router.push("/user/auth/login");
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-extrabold text-black uppercase">Register User</h1>
        <p className="mt-2 text-lg text-black">Create a new user account</p>

        {error && (
          <div className="my-4 bg-red-100 text-red-700 p-3 rounded text-sm text-left">
            {error}
          </div>
        )}
        {isSuccess && (
          <div className="my-4 bg-green-100 text-green-700 p-3 rounded text-sm text-left">
            Register berhasil! Redirecting...
          </div>
        )}

        <form className="mt-8 space-y-4" autoComplete="off" onSubmit={handleSubmit}>
          {/* Code */}
          <div>
            <input
              ref={codeRef}
              id="code"
              type="text"
              placeholder="Code"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-grey-300 focus:outline-none"
            />
          </div>
          {/* Username */}
          <div>
            <input
              ref={usernameRef}
              id="username"
              type="text"
              placeholder="Username"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-grey-300 focus:outline-none"
            />
          </div>
          {/* Email */}
          <div>
            <input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-grey-300 focus:outline-none"
            />
          </div>
          {/* Password */}
          <div className="relative">
            <input
              ref={passwordRef}
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-grey-300 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
              onClick={() => setShowPass((v) => !v)}
              tabIndex={-1}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {/* Repeat Password */}
          <div className="relative">
            <input
              ref={repeatPasswordRef}
              id="repeat-password"
              type={showRepeat ? "text" : "password"}
              placeholder="Repeat Password"
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 rounded bg-white placeholder-black text-black border border-grey-300 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
              onClick={() => setShowRepeat((v) => !v)}
              tabIndex={-1}
              aria-label={showRepeat ? "Hide password" : "Show password"}
            >
              {showRepeat ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3 bg-white text-black font-semibold rounded border-2 border-black
              transition-all duration-200 ease-in-out
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="h-5 w-5 animate-spin" /> Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-black">
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleLoginClick}
            disabled={isLoading}
            className="underline font-semibold inline-flex items-center gap-2"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterUserPage;
