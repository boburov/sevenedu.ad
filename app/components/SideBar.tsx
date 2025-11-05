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
import { useState } from "react";
import logo from "../image/logo.png";

const SideBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    // Local ma'lumotlarni tozalaymiz
    localStorage.clear();
    sessionStorage.clear();

    // Cookie’lar bo‘lsa, ularni ham tozalash (faqat browserdan kirganda)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    // Login sahifasiga yo‘naltiramiz
    router.push("/login");
  };

  const navLinks = [
    { label: "Bosh Sahifa", href: "/", icon: Home },
    { label: "Kurs Yaratish", href: "/courses", icon: PlusSquare },
    { label: "Lug'at Qo'shish", href: "/dictionary", icon: BookA },
    { label: "Test Qo'shish", href: "/quiz", icon: PlusSquare },
    {
      label: "Foydalanuvchilarga Sms",
      href: "/send-sms",
      icon: MessageSquareIcon,
    },
    { label: "Dars Qo'shish", href: "/lessons", icon: PlusSquare },
    { label: "Qayta joylashtrish", href: "/relocation", icon: Replace },
    { label: "Savol Qo'shish", href: "/sentence-puzzle", icon: BookA },
    { label: "O'quvchiga kurs qoshish", href: "/addmember", icon: PlusSquare }
  ];

  return (
    <>
  

      <aside
        className={`fixed top-0 left-0 h-screen p-6 
        bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-lg border-r border-gray-700 shadow-2xl 
        text-white flex flex-col z-40 transition-all duration-300 ${
          isCollapsed ? "min-w-[80px]" : "min-w-[390px]"
        }`}
      >
        {/* Logo Section */}
        <Link
          href="/"
          className={`flex items-center gap-3 mb-10 hover:opacity-90 transition ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="relative w-10 h-10">
            <Image src={logo} alt="7edu logo" fill className="object-contain" />
          </div>
          {!isCollapsed && (
            <h1 className="text-lg sm:text-xl font-bold tracking-wide">
              <span className="text-blue-400">7EDU</span>{" "}
              <span className="text-white/90">ADMIN</span>
            </h1>
          )}
        </Link>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-2">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;

            return (
              <li key={i}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                      : "hover:bg-gray-700/50 hover:text-blue-400 text-white/80"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <link.icon size={20} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{link.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                      {link.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User Section */}
        <div className="mt-auto">
          <div
            className={`flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-800/50 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center">
              <User size={20} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">Admin User</span>
                <span className="text-xs text-gray-400">Super Admin</span>
              </div>
            )}
          </div>

          {/* Additional Options */}
          {!isCollapsed && (
            <div className="border-t border-gray-700 pt-4">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:text-blue-400 hover:bg-gray-700/50 transition-colors"
              >
                <Settings size={18} />
                <span className="text-sm">Sozlamalar</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:text-red-400 hover:bg-gray-700/50 transition-colors w-full"
              >
                <LogOut size={18} />
                <span className="text-sm">Chiqish</span>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-6 text-xs text-white/30">
            © 2025 7Edu Platformasi
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default SideBar;
