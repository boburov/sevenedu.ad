"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  User as UserIcon,
  Trash2,
  GraduationCap,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { getAllUser } from "@/app/api/service/api";
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
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState<string | null>(null);
  const router = useRouter();

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
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
    setLoading(true);
    getAllUser()
      .then((res) => setUsers(res))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  }, []);

  // User sahifasiga o{'’'}tish
  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  // === Kursga qo{'’'}shish ===
  const addUserToCourse = async (userId: string, userEmail: string) => {
    if (addLoading) return;
    
    setAddLoading(userId);
    try {
      // Agar sizda kursga qo{'’'}shish uchun API bo{'’'}lsa, shu yerga qo{'’'}shing
      // Masalan: const res = await axios.post("/api/add-to-course", { userId });
      
      // Hozircha alert orqali ko{'’'}rsatamiz
      alert(`Foydalanuvchi ${userEmail} kursga qo{'’'}shildi ✅\nNote: API endpointni sozlang`);
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi ❌");
    } finally {
      setAddLoading(null);
    }
  };

  // === Foydalanuvchini o{'’'}chirish ===
  const deleteUser = async (userId: string, userEmail: string) => {
    if (deleteLoading || !confirm(`Rostdan ham ${userEmail} foydalanuvchisini o{'’'}chirmoqchimisiz?`)) return;

    setDeleteLoading(userId);
    try {
      const res = await fetch("http://sevenedu.store/user/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      if (!res.ok) throw new Error("O{'’'}chirishda xatolik");
      
      setUsers(users.filter((u) => u.id !== userId));
      alert("Foydalanuvchi o{'’'}chirildi ✅");
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi ❌");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.surname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 min-h-screen">
      {/* Sarlavha */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Foydalanuvchilar</h1>
        <p className="text-gray-600">Barcha ro{'’'}yxatdan o{'’'}tgan foydalanuvchilar</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Email, ism yoki familiya bo{'’'}yicha qidirish..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-2">Foydalanuvchilar yuklanmoqda...</p>
        </div>
      )}

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {!loading && filteredUsers.map((user) => (
          <div
            key={user.id}
            className="relative group rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 p-6 hover:border-blue-300"
          >
            {/* User Info - Clickable area */}
            <div 
              className="cursor-pointer"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {user.name} {user.surname}
                  </h2>
                  <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md break-all font-mono">
                ID: {user.id}
              </p>
            </div>

            {/* Menu Button */}
            <div className="absolute top-4 right-4">
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(user.id);
                }}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {openMenuId === user.id && (
              <div 
                className="absolute top-12 right-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-48 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => addUserToCourse(user.id, user.email)}
                  disabled={addLoading === user.id}
                  className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-green-600" />
                  <span>
                    {addLoading === user.id ? "Qo{'’'}shilyapti..." : "Kursga qo{'’'}shish"}
                  </span>
                </button>
                
                <button
                  onClick={() => deleteUser(user.id, user.email)}
                  disabled={deleteLoading === user.id}
                  className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-t border-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {deleteLoading === user.id ? "O{'’'}chirilmoqda..." : "O{'’'}chirish"}
                  </span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {!loading && filteredUsers.length === 0 && users.length > 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Hech narsa topilmadi</p>
          <p className="text-gray-400 mt-2">Boshqa qidiruv so{'’'}zini kiriting</p>
        </div>
      )}

      {/* No Users */}
      {!loading && users.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Foydalanuvchilar mavjud emas</p>
        </div>
      )}
    </div>
  );
};

export default Page;