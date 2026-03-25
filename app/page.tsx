"use client";

import { useEffect, useState } from "react";
import {
  EllipsisVertical,
  Mail,
  User as UserIcon,
  BadgeInfo,
  Trash2,
  MessageSquare,
  Search,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllUser } from "./api/service/api";

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phonenumber?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  // boshqa maydonlar kerak bo'lsa qo'shishingiz mumkin
}

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  // Tashqariga bosganda menu yopilishi
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    getAllUser()
      .then((res) => {
        setUsers(res);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // Statistikani hisoblash
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalUsers = users.length;
  const todayUsers = users.filter((u) => new Date(u.createdAt) >= today).length;
  const weekUsers = users.filter((u) => new Date(u.createdAt) >= oneWeekAgo).length;
  const monthUsers = users.filter((u) => new Date(u.createdAt) >= oneMonthAgo).length;

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    `${user.name} ${user.surname}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Foydalanuvchilar
        </h1>
      </div>

      {/* Statistika Kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Jami foydalanuvchilar</p>
              <p className="text-4xl font-semibold text-gray-800 mt-2">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bugun qo‘shilgan</p>
              <p className="text-4xl font-semibold text-emerald-600 mt-2">{todayUsers}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Oxirgi 7 kun</p>
              <p className="text-4xl font-semibold text-amber-600 mt-2">{weekUsers}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Oxirgi 30 kun</p>
              <p className="text-4xl font-semibold text-violet-600 mt-2">{monthUsers}</p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Qidiruv */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Ism, familiya yoki email orqali qidirish..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Foydalanuvchilar ro‘yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const createdDate = new Date(user.createdAt);
          const isNew = (Date.now() - createdDate.getTime()) / (1000 * 3600 * 24) < 7;

          return (
            <div
              key={user.id}
              className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 cursor-pointer group"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl">
                      {user.name?.[0]}{user.surname?.[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {user.name} {user.surname}
                      </h2>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {user.phonenumber && (
                    <p className="text-sm text-gray-600 mt-4 flex items-center gap-2">
                      📱 {user.phonenumber}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4 text-xs">
                    <span className={`px-3 py-1 rounded-full font-medium ${user.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                      }`}>
                      {user.role}
                    </span>
                    {user.isVerified && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                        Tasdiqlangan
                      </span>
                    )}
                    {isNew && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                        Yangi
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    Qo‘shilgan: {createdDate.toLocaleDateString("uz-UZ")}
                  </p>
                </div>

                {/* Menu tugmasi */}
                <button
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(user.id);
                  }}
                >
                  <EllipsisVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Dropdown Menu */}
              {openMenuId === user.id && (
                <div
                  className="absolute top-20 right-6 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl w-52 py-1 text-sm overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <BadgeInfo className="w-4 h-4" /> Ma'lumotlar
                  </div>
                  <div className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                    <MessageSquare className="w-4 h-4" /> SMS jo‘natish
                  </div>
                  <Link
                    href={`/addmember/${user.email}`}
                    className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GraduationCap className="w-4 h-4" /> Kursga qo‘shish
                  </Link>
                  <div className="px-5 py-3 hover:bg-red-50 flex items-center gap-3 cursor-pointer text-red-600 border-t">
                    <Trash2 className="w-4 h-4" /> O‘chirish
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-12 text-lg">
            Hech qanday foydalanuvchi topilmadi.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;