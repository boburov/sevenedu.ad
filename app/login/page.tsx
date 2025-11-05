"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  // Hardcoded admin data (sen bergan JSON)
  const ADMIN = {
    name: "Admin",
    surname: "Admin",
    email: "sevenedu.main@gmail.com",
    role: "ADMIN",
    password: "12345678",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Agar localda user bo'lsa avtomatik /home ga yo'naltir
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        // optional: validatsiya qilish
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          router.push("/");
        }
      }
    } catch {
      // nada
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const inputEmail = (email || "").trim();
    const inputPassword = (password || "").trim();

    setTimeout(() => {
      if (
        inputEmail.toLowerCase() === ADMIN.email.toLowerCase() &&
        inputPassword === ADMIN.password
      ) {
        // Saqlashga chiqiladigan user ob'ekti
        const userToStore = {
          name: ADMIN.name,
          surname: ADMIN.surname,
          email: ADMIN.email,
          role: ADMIN.role,
          // token yoki session id o'rniga oddiy flag
          isAuthenticated: true,
          loggedAt: new Date().toISOString(),
        };

        try {
          localStorage.setItem("user", JSON.stringify(userToStore));
        } catch (err) {
          console.error("localStorage error:", err);
        }

        // Redirect to home
        router.push("/home");
      } else {
        setError("Email yoki parol notoʻgʻri.");
      }
      setLoading(false);
    }, 400); // kichik "fake" delay UX uchun
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400">
      <div className="bg-white/20 backdrop-blur-lg shadow-xl rounded-3xl w-96 p-8 flex flex-col items-center gap-6 border border-white/30">
        <h1 className="text-white text-3xl font-semibold tracking-wide mb-2">
          Kirish
        </h1>
        <p className="text-white/80 text-sm mb-4 text-center">
          Xush kelibsiz! Iltimos, akkauntingizga kiring.
        </p>

        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Email"
            className="px-4 py-3 rounded-2xl bg-white/70 focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder:text-gray-400 outline-none transition-all duration-200"
            autoComplete="off"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Parol"
            className="px-4 py-3 rounded-2xl bg-white/70 focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder:text-gray-400 outline-none transition-all duration-200"
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-blue-400/50 disabled:opacity-60"
          >
            {loading ? "Kirish..." : "Kirish"}
          </button>
        </form>

        {error && <p className="text-red-300 text-sm">{error}</p>}

        <p className="text-white/80 text-sm mt-4">
          Hisobingiz yoʻqmi?{" "}
          <a
            href="#"
            className="text-white font-semibold hover:underline hover:text-blue-200 transition"
          >
            Roʻyxatdan oʻting
          </a>
        </p>
      </div>
    </div>
  );
};

export default Page;
