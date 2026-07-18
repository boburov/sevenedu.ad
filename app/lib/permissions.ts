"use client";

import { useEffect, useState } from "react";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export interface AdminUser {
  id: string;
  name?: string;
  surname?: string;
  email?: string;
  role?: string; // "OWNER" | "STAFF"
  permissions?: string[];
}

/** localStorage dagi admin user'ni o'qiydi. */
export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function isOwnerUser(user: AdminUser | null): boolean {
  return user?.role === "OWNER";
}

/** Berilgan user resurs+amalga ruxsatga egami? OWNER har doim ega. */
export function userCan(
  user: AdminUser | null,
  resource: string,
  action: PermissionAction,
): boolean {
  if (!user) return false;
  if (user.role === "OWNER") return true;
  const perms = user.permissions ?? [];
  return perms.includes(`${resource}.${action}`);
}

/** Resurs bo'yicha biror amalga ruxsat bormi (bo'limni ko'rsatish uchun). */
export function userCanAny(user: AdminUser | null, resource: string): boolean {
  if (!user) return false;
  if (user.role === "OWNER") return true;
  const perms = user.permissions ?? [];
  return perms.some((p) => p.startsWith(`${resource}.`));
}

/**
 * Route uchun kirish ruxsatini tekshiradi (URL bilan to'g'ridan-to'g'ri kirishni bloklash uchun).
 * Birinchi path segmenti bo'yicha aniqlaydi.
 */
export function canAccessRoute(user: AdminUser | null, pathname: string): boolean {
  if (!user) return false;
  if (user.role === "OWNER") return true;

  const seg = "/" + (pathname.split("/").filter(Boolean)[0] ?? "");

  switch (seg) {
    case "/":
    case "/settings":
      return true; // dashboard va shaxsiy sozlamalar hammaga
    case "/courses":
      return userCanAny(user, "courses") || userCanAny(user, "lessons");
    case "/lessons":
    case "/relocation":
      return userCanAny(user, "lessons");
    case "/shop":
      return userCanAny(user, "shop");
    case "/movies":
      return userCanAny(user, "movies");
    case "/create-user":
    case "/users":
      return userCanAny(user, "users");
    case "/dictionary":
      return userCanAny(user, "dictionary");
    case "/quiz":
    case "/tests":
      return userCanAny(user, "quiz");
    case "/sentence-puzzle":
      return userCanAny(user, "sentencePuzzle");
    case "/send-sms":
      return userCanAny(user, "notifications");
    case "/addmember":
      return userCanAny(user, "enrollment");
    case "/staff":
      return false; // faqat OWNER (yuqorida qaytarilgan)
    default:
      return true; // noma'lum route'larni bloklamaymiz
  }
}

/** React hook — localStorage 'user' ni o'qiydi va helperlarni qaytaradi. */
export function usePermissions() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getAdminUser());
    setReady(true);

    // Boshqa tab yoki verify yangilaganda sinxron bo'lsin
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") setUser(getAdminUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    user,
    ready,
    isOwner: isOwnerUser(user),
    can: (resource: string, action: PermissionAction) =>
      userCan(user, resource, action),
    canAny: (resource: string) => userCanAny(user, resource),
  };
}
