"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SideBar from "./components/SideBar";
import { ToastContainer } from "react-toastify";
import { verifyAdminToken } from "./api/service/api";
import { canAccessRoute, type AdminUser } from "./lib/permissions";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setChecked(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    verifyAdminToken()
      .then((me: AdminUser) => {
        // Ruxsatlarni serverdan yangilab, localStorage'ni yangilaymiz
        if (me && typeof me === "object") {
          localStorage.setItem("user", JSON.stringify(me));
        }
        // Route-level ruxsat: ruxsatsiz sahifaga URL bilan kirilsa -> bosh sahifa
        if (!canAccessRoute(me, pathname)) {
          router.replace("/");
          return;
        }
        setChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
      });
  }, [router, pathname]);

  if (pathname === "/login") {
    return (
      <>
        <ToastContainer />
        {children}
      </>
    );
  }

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <>
      <SideBar />
      <ToastContainer />
      {children}
    </>
  );
}
