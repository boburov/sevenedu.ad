"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const LogoMark = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.08" />
    <text
      x="50%"
      y="54%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="white"
      fontSize="16"
      fontWeight="700"
      fontFamily="Georgia, serif"
      letterSpacing="1.2"
    >
      7E
    </text>
    <rect
      x="1"
      y="1"
      width="34"
      height="34"
      rx="7"
      stroke="white"
      strokeOpacity="0.15"
      strokeWidth="1"
    />
  </svg>
);

const Page = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Agar allaqachon login qilingan bo'lsa → bosh sahifaga o'tkazish
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.email) {
          router.push("/");
        }
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.sevenedu.store/auth/admin/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 soniya
        }
      );

      const { token, user } = response.data;

      // Muvaffaqiyatli login
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Bosh sahifaga o'tish
      router.push("/");
      router.refresh(); // agar kerak bo'lsa

    } catch (err: any) {
      console.error("Login xatosi:", err);

      if (err.response) {
        // Serverdan kelgan xato
        setError(err.response.data?.message || "Email yoki parol noto‘g‘ri");
      } else if (err.request) {
        // Serverga ulana olmadi
        setError("Server bilan bog‘lanishda muammo. Internetni tekshiring.");
      } else {
        setError("Noma’lum xatolik yuz berdi. Qayta urinib ko‘ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-4">
            <LogoMark />
            <div>
              <div className="text-white text-4xl font-bold tracking-[0.08em] font-serif">
                7EDU
              </div>
              <div className="text-[11px] tracking-[3px] text-white/40 uppercase font-medium -mt-1">
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl shadow-black/80 p-10 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Xush kelibsiz
            </h1>
            <p className="text-white/50 mt-2 text-sm">
              Admin akkauntingizga kirish
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 block mb-1.5 pl-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sevenedu.main@gmail.com"
                  className="w-full bg-zinc-900 border border-white/10 focus:border-white/30 text-white placeholder:text-white/30 rounded-2xl py-3.5 pl-11 pr-4 outline-none transition-all focus:ring-1 focus:ring-white/20"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 block mb-1.5 pl-1">
                Parol
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-white/10 focus:border-white/30 text-white placeholder:text-white/30 rounded-2xl py-3.5 pl-11 pr-12 outline-none transition-all focus:ring-1 focus:ring-white/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-950/50 border border-red-900/50 py-2.5 rounded-2xl">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-white/90 text-black font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-70 mt-4"
            >
              {loading ? (
                "Kirilmoqda..."
              ) : (
                <>
                  <LogIn size={20} />
                  Kirish
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/30 text-xs">
              © 2025 7Edu • Barcha huquqlar himoyalangan
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-white/20 text-xs tracking-widest">
            SUPER ADMIN ACCESS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;