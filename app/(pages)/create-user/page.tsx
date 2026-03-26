"use client";
import { useState } from "react";

type Role = "USER" | "ADMIN";

export default function CreateUserPage() {
    const [form, setForm] = useState({
        name: "", surname: "", email: "",
        password: "", confirmPassword: "",
        phonenumber: "", role: "USER" as Role,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const set = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const validate = () => {
        if (!form.email || !form.password)
            return "Email va parol majburiy";

        if (form.password.length < 6)
            return "Parol kamida 6 ta belgidan iborat bo‘lishi kerak";

        if (form.password !== form.confirmPassword)
            return "Parollar mos emas";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess("");

        const err = validate();
        if (err) return setError(err);

        setLoading(true);

        try {
            const res = await fetch("https://api.sevenedu.store/user/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    surname: form.surname,
                    email: form.email,
                    password: form.password,
                    phonenumber: form.phonenumber,
                    role: form.role,
                }),
            });

            const data = await res.json();

            if (!res.ok)
                throw new Error(data.message || "Xatolik yuz berdi");

            setSuccess("Foydalanuvchi muvaffaqiyatli yaratildi ✅");

            setForm({
                name: "",
                surname: "",
                email: "",
                password: "",
                confirmPassword: "",
                phonenumber: "",
                role: "USER",
            });

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const inp =
        "w-full h-11 px-3 border border-zinc-200 bg-transparent text-sm text-black outline-none focus:border-black hover:border-zinc-400 transition-colors placeholder:text-zinc-400";

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg border border-black p-10 relative">

                {/* Corner accents */}
                <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-black" />
                <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-black" />

                {/* Header */}
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-zinc-400 mb-2">
                    SevenEdu · Admin
                </p>

                <h1 className="font-light tracking-tight text-black text-4xl">
                    Foydalanuvchi <em className="font-normal italic">yaratish</em>
                </h1>

                <div className="w-8 h-px bg-black mt-4 mb-8" />

                {/* Alerts */}
                {error && (
                    <div className="flex items-center gap-2 p-3 mb-6 border border-black text-xs font-medium text-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 p-3 mb-6 bg-black text-xs font-medium text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Ism">
                            <input name="name" value={form.name} onChange={set} className={inp} placeholder="Ali" />
                        </F>
                        <F label="Familiya">
                            <input name="surname" value={form.surname} onChange={set} className={inp} placeholder="Valiyev" />
                        </F>
                    </div>

                    {/* Contact */}
                    <F label="Email manzil">
                        <input name="email" type="email" value={form.email} onChange={set} className={inp} placeholder="ali@example.com" />
                    </F>

                    <F label="Telefon raqam">
                        <input name="phonenumber" value={form.phonenumber} onChange={set} className={inp} placeholder="+998 XX XXX XX XX" />
                    </F>

                    {/* Role */}
                    <F label="Rol">
                        <div className="grid grid-cols-2 border border-zinc-200">
                            {(["USER", "ADMIN"] as Role[]).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setForm({ ...form, role: r })}
                                    className={`py-2.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors first:border-r first:border-zinc-200
                  ${form.role === r
                                            ? "bg-black text-white"
                                            : "text-zinc-400 hover:text-black hover:bg-zinc-50"
                                        }`}
                                >
                                    {r === "USER" ? "Foydalanuvchi" : "Admin"}
                                </button>
                            ))}
                        </div>
                    </F>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                        <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-300 shrink-0">
                            Xavfsizlik
                        </span>
                        <div className="flex-1 h-px bg-zinc-100" />
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Parol">
                            <input name="password" type="password" value={form.password} onChange={set} className={inp} placeholder="••••••" />
                        </F>
                        <F label="Tasdiqlash">
                            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={set} className={inp} placeholder="••••••" />
                        </F>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-2 bg-black text-white text-[10px] font-semibold tracking-[0.3em] uppercase border border-black
            hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                Yaratilmoqda
                            </>
                        ) : (
                            "Foydalanuvchi yaratish"
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="group">
            <label className="block text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-400 group-focus-within:text-black transition-colors mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}