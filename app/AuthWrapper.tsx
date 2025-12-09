"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "./components/SideBar";
import { ToastContainer } from "react-toastify";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");
    if (!email || !password) {
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <SideBar />
      <ToastContainer />
      {children}
    </>
  );
}