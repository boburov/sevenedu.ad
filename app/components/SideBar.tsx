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
  UserPlus,
  ShoppingBag,
  Film,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../image/logo.png"
import { usePermissions } from "../lib/permissions";

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
  const [adminUser, setAdminUser] = useState<{
    name?: string;
    surname?: string;
    email?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setAdminUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    router.push("/login");
  };

  const { canAny, isOwner, ready } = usePermissions();

  const navLinks = [
    { label: "Bosh Sahifa", href: "/", icon: Home, group: "main", show: true },
    { label: "Kurs Yaratish", href: "/courses", icon: PlusSquare, group: "main", show: canAny("courses") || canAny("lessons") },
    { label: "Do'kon", href: "/shop", icon: ShoppingBag, group: "main", show: canAny("shop") },
    { label: "Kinolar", href: "/movies", icon: Film, group: "main", show: canAny("movies") },
    { label: "Foydalanuvchi Yaratish", href: "/create-user", icon: UserPlus, group: "main", show: canAny("users") },
    { label: "Lug'at Qo'shish", href: "/dictionary", icon: BookA, group: "main", show: canAny("dictionary") },
    { label: "Test Qo'shish", href: "/quiz", icon: PlusSquare, group: "main", show: canAny("quiz") },
    { label: "Foydalanuvchilarga Sms", href: "/send-sms", icon: MessageSquareIcon, group: "comms", show: canAny("notifications") },
    { label: "Dars Qo'shish", href: "/lessons", icon: PlusSquare, group: "comms", show: canAny("lessons") },
    { label: "Qayta joylashtrish", href: "/relocation", icon: Replace, group: "comms", show: canAny("lessons") },
    { label: "Savol Qo'shish", href: "/sentence-puzzle", icon: BookA, group: "comms", show: canAny("sentencePuzzle") },
    { label: "O'quvchiga kurs qoshish", href: "/addmember", icon: PlusSquare, group: "comms", show: canAny("enrollment") },
    { label: "Xodimlar", href: "/staff", icon: Users, group: "comms", show: isOwner },
  ];

  // Ruxsat hali yuklanmagan bo'lsa hech narsa ko'rsatmaymiz (miltillashning oldini olish)
  const visibleLinks = ready ? navLinks.filter((l) => l.show) : navLinks.filter((l) => l.href === "/");
  const mainLinks = visibleLinks.filter((l) => l.group === "main");
  const commsLinks = visibleLinks.filter((l) => l.group === "comms");

  return (
    <aside className="fixed top-0 left-0 h-screen w-[300px] bg-[#0a0a0a] border-r border-white/10 flex flex-col z-40 p-6 font-sans">
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
          {mainLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <li key={index}>
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

        {commsLinks.length > 0 && <Divider />}

        {/* Boshqaruv Section */}
        {commsLinks.length > 0 && (
        <div className="text-[10px] font-medium tracking-[2px] uppercase text-white/25 mb-2 px-1 mt-4">
          BOSHQARUV
        </div>
        )}
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
            <div className="text-white text-sm font-medium truncate">
              {adminUser?.name
                ? `${adminUser.name} ${adminUser.surname ?? ""}`.trim()
                : "Admin User"}
            </div>
            <div className="text-white/40 text-xs truncate">
              {adminUser?.role || "SUPER ADMIN"}
            </div>
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