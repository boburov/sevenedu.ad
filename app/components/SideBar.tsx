"use client";

import {
  BookA,
  Home,
  MessageSquareIcon,
  PlusSquare,
  Replace,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import logo from "../image/logo.png"

const LogoMark = () => (
  <Image
    src={logo}
    className="w-10"
    alt="logo" />
);

const Divider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />
);

const SideBar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    router.push("/login");
  };

  const navLinks = [
    { label: "Bosh Sahifa", href: "/", icon: Home, group: "main" },
    { label: "Kurs Yaratish", href: "/courses", icon: PlusSquare, group: "main" },
    { label: "Lug'at Qo'shish", href: "/dictionary", icon: BookA, group: "main" },
    { label: "Test Qo'shish", href: "/quiz", icon: PlusSquare, group: "main" },
    { label: "Foydalanuvchilarga Sms", href: "/send-sms", icon: MessageSquareIcon, group: "comms" },
    { label: "Dars Qo'shish", href: "/lessons", icon: PlusSquare, group: "comms" },
    { label: "Qayta joylashtrish", href: "/relocation", icon: Replace, group: "comms" },
    { label: "Savol Qo'shish", href: "/sentence-puzzle", icon: BookA, group: "comms" },
    { label: "O'quvchiga kurs qoshish", href: "/addmember", icon: PlusSquare, group: "comms" },
  ];

  const mainLinks = navLinks.filter((l) => l.group === "main");
  const commsLinks = navLinks.filter((l) => l.group === "comms");

  return (
    <aside className="fixed top-0 left-0 h-screen w-[260px] bg-[#0a0a0a] border-r border-white/10 flex flex-col z-40 p-6 font-sans">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8">
        <LogoMark />
        <div>
          <div className="text-white text-[22px] font-bold tracking-[0.08em] font-serif">
            7EDU
          </div>
          <div className="text-[10px] tracking-[2px] text-white/30 uppercase font-medium">
            Admin Panel
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Platform Section */}
        <div className="text-[10px] font-medium tracking-[2px] uppercase text-white/25 mb-2 px-1">
          PLATFORM
        </div>
        <ul className="space-y-1">
          {mainLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200
                    ${isActive
                      ? "bg-white text-black font-medium"
                      : "text-white/50 hover:bg-white/5 hover:text-white/90"
                    }`}
                >
                  <link.icon size={17} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Divider />

        {/* Boshqaruv Section */}
        <div className="text-[10px] font-medium tracking-[2px] uppercase text-white/25 mb-2 px-1 mt-4">
          BOSHQARUV
        </div>
        <ul className="space-y-1">
          {commsLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200
                    ${isActive
                      ? "bg-white text-black font-medium"
                      : "text-white/50 hover:bg-white/5 hover:text-white/90"
                    }`}
                >
                  <link.icon size={17} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto pt-6">
        <Divider />

        {/* User Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0">
            <User size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">Admin User</div>
            <div className="text-white/40 text-xs">SUPER ADMIN</div>
          </div>
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all mb-1"
        >
          <Settings size={17} />
          <span>Sozlamalar</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
        >
          <LogOut size={17} />
          <span>Chiqish</span>
        </button>

        {/* Footer */}
        <div className="text-center text-[10px] text-white/10 mt-8">
          © 2025 7Edu
        </div>
      </div>
    </aside>
  );
};

export default SideBar;