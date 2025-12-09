"use client";

import { useEffect, useState } from "react";
import { getAllUser } from "./api/service/api";
import {
  EllipsisVertical,
  Mail,
  User as UserIcon,
  BadgeInfo,
  Trash2,
  MessageSquare,
  Search,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  surname: string;
  password?: string;
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

  // Tashqariga bosganda menuni yopish
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    getAllUser()
      .then((res) => {
        setUsers(res);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 min-h-screen">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Email orqali qidirish..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg shadow-md hover:shadow-xl transition duration-300 p-6 cursor-pointer"
            onClick={() => handleUserClick(user.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-500" />
                  {user.name} {user.surname}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </p>
                <p className="text-sm text-gray-500 mt-1 break-all">
                  ID: {user.id}
                </p>
              </div>

              {/* Ellipsis Menu Button */}
              <button
                className="text-gray-500 hover:text-gray-700 ml-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(user.id);
                }}
              >
                <EllipsisVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Tooltip Dropdown Menu */}
            {openMenuId === user.id && (
              <div
                className="absolute top-14 right-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <ul className="bg-white border border-gray-200 rounded-xl shadow-lg w-44 text-sm font-medium text-gray-700 divide-y overflow-hidden">
                  <li
                    className="p-3 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <BadgeInfo className="w-4 h-4" /> {`Ma'lumotlar`}
                  </li>
                  <li className="p-3 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors">
                    <MessageSquare className="w-4 h-4" /> SMS jo{"’"}natish
                  </li>
                  <li>
                    <Link
                      className="p-3 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors block"
                      href={"addmember/" + user.email}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GraduationCap className="w-4 h-4" /> Kursga {`qo'shish`}
                    </Link>
                  </li>
                  <li className="p-3 hover:bg-gray-100 flex items-center gap-2 cursor-pointer text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" /> O{"’"}chirish
                  </li>
                </ul>
              </div>
            )}
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">
            Foydalanuvchi topilmadi.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
