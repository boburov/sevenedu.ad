"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EllipsisVertical,
  Mail,
  BadgeInfo,
  Trash2,
  MessageSquare,
  Search,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  BookOpen,
  Award,
  Activity,
  Coins,
  CheckCircle2,
  CircleDot,
  Layers,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllUser, getAdminStats } from "./api/service/api";

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phonenumber?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface AdminStats {
  users: {
    total: number;
    verified: number;
    unverified: number;
    verificationRate: number;
    google: number;
    regular: number;
    today: number;
    week: number;
    month: number;
    activeToday: number;
    activeWeek: number;
  };
  content: {
    courses: number;
    lessons: number;
    quizzes: number;
    dictionaryEntries: number;
    sentencePuzzles: number;
  };
  enrollments: {
    total: number;
    finished: number;
    completionRate: number;
    monthly: number;
    fullCharge: number;
    free: number;
  };
  activity: { total: number; today: number; week: number };
  certificates: { total: number; today: number };
  charts: {
    newUsersByDay: { date: string; count: number }[];
    topCourses: {
      id: string;
      title: string;
      shortName: string;
      thumbnail: string;
      enrollments: number;
    }[];
  };
  lists: {
    topUsersByCoins: {
      id: string;
      name: string;
      surname: string;
      email: string;
      coins: number;
      profilePic: string;
    }[];
    recentUsers: {
      id: string;
      name: string;
      surname: string;
      email: string;
      createdAt: string;
      register_type: string;
      isVerified: boolean;
    }[];
    recentCertificates: {
      id: string;
      issuedAt: string;
      score: number;
      user: { id: string; name: string; surname: string; email: string };
      course: { id: string; title: string };
    }[];
  };
  generatedAt: string;
}

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  tone?: string;
}) => {
  const tones: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
    rose: "bg-rose-100 text-rose-600",
    sky: "bg-sky-100 text-sky-600",
    indigo: "bg-indigo-100 text-indigo-600",
    teal: "bg-teal-100 text-teal-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones[tone]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    getAllUser()
      .then((res) => setUsers(res))
      .catch((err) => console.error("Error fetching users:", err));

    getAdminStats()
      .then((res) => setStats(res))
      .catch((err) => {
        console.error("Stats error:", err);
        setStatsError(typeof err === "string" ? err : "Statistikani yuklab bo'lmadi");
      });
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          `${user.name} ${user.surname}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [users, search]
  );

  const chartMax = useMemo(
    () =>
      Math.max(
        1,
        ...((stats?.charts.newUsersByDay ?? []).map((d) => d.count))
      ),
    [stats]
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Platformaning umumiy holati va statistikasi
          </p>
        </div>
        {stats?.generatedAt && (
          <span className="text-xs text-gray-400">
            Yangilangan:{" "}
            {new Date(stats.generatedAt).toLocaleString("uz-UZ", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
        )}
      </div>

      {statsError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-2xl">
          {statsError}
        </div>
      )}

      {/* Primary stats */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Foydalanuvchilar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Jami foydalanuvchilar"
            value={stats?.users.total ?? users.length}
            sub={
              stats
                ? `${stats.users.verified} tasdiqlangan • ${stats.users.unverified} tasdiqlanmagan`
                : undefined
            }
            icon={Users}
            tone="blue"
          />
          <StatCard
            label="Bugun qo'shildi"
            value={stats?.users.today ?? 0}
            sub={`Oxirgi 7 kun: ${stats?.users.week ?? 0}`}
            icon={Clock}
            tone="emerald"
          />
          <StatCard
            label="Oxirgi 30 kun"
            value={stats?.users.month ?? 0}
            sub="Yangi ro'yxatdan o'tganlar"
            icon={Calendar}
            tone="violet"
          />
          <StatCard
            label="Bugun faol"
            value={stats?.users.activeToday ?? 0}
            sub={`Hafta davomida: ${stats?.users.activeWeek ?? 0}`}
            icon={TrendingUp}
            tone="amber"
          />
        </div>
      </section>

      {/* Content + enrollments */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Kontent va obunalar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Kurslar"
            value={stats?.content.courses ?? 0}
            icon={BookOpen}
            tone="sky"
          />
          <StatCard
            label="Darslar"
            value={stats?.content.lessons ?? 0}
            icon={PlayCircle}
            tone="indigo"
          />
          <StatCard
            label="Testlar"
            value={stats?.content.quizzes ?? 0}
            icon={CircleDot}
            tone="amber"
          />
          <StatCard
            label="Lug'at so'zlari"
            value={stats?.content.dictionaryEntries ?? 0}
            icon={Layers}
            tone="teal"
          />
          <StatCard
            label="Sentence puzzles"
            value={stats?.content.sentencePuzzles ?? 0}
            icon={MessageSquare}
            tone="violet"
          />
          <StatCard
            label="Sertifikatlar"
            value={stats?.certificates.total ?? 0}
            sub={`Bugun: ${stats?.certificates.today ?? 0}`}
            icon={Award}
            tone="emerald"
          />
        </div>
      </section>

      {/* Detail blocks */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Verification */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Tasdiqlash darajasi</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-800">
              {stats?.users.verificationRate ?? 0}%
            </p>
            <p className="text-xs text-gray-400 pb-1.5">
              {stats?.users.verified ?? 0} / {stats?.users.total ?? 0}
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${stats?.users.verificationRate ?? 0}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Google login</p>
              <p className="text-lg font-semibold text-gray-800">
                {stats?.users.google ?? 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Oddiy login</p>
              <p className="text-lg font-semibold text-gray-800">
                {stats?.users.regular ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Enrollments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Obunalar</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-800">
              {stats?.enrollments.total ?? 0}
            </p>
            <p className="text-xs text-gray-400 pb-1.5">jami</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tugatilgan: {stats?.enrollments.finished ?? 0} •{" "}
            {stats?.enrollments.completionRate ?? 0}%
          </p>
          <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${stats?.enrollments.completionRate ?? 0}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5 text-sm">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Monthly</p>
              <p className="text-lg font-semibold text-gray-800">
                {stats?.enrollments.monthly ?? 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase">To'liq</p>
              <p className="text-lg font-semibold text-gray-800">
                {stats?.enrollments.fullCharge ?? 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Free</p>
              <p className="text-lg font-semibold text-gray-800">
                {stats?.enrollments.free ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-gray-800">Dars faolligi</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-800">
              {stats?.activity.today ?? 0}
            </p>
            <p className="text-xs text-gray-400 pb-1.5">bugun ko'rilgan</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Oxirgi 7 kun: {stats?.activity.week ?? 0} • Jami:{" "}
            {stats?.activity.total ?? 0}
          </p>
          <div className="mt-5">
            <p className="text-xs text-gray-500 mb-2">
              Oxirgi 30 kunlik ro'yxatdan o'tish
            </p>
            <div className="flex items-end gap-[2px] h-20">
              {(stats?.charts.newUsersByDay ?? []).map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count}`}
                  className="flex-1 bg-blue-500/80 hover:bg-blue-600 rounded-sm transition-all"
                  style={{
                    height: `${Math.max(4, (d.count / chartMax) * 100)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top courses + Top users + Recent */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" /> Eng ko'p obuna bo'lgan kurslar
          </h3>
          <div className="space-y-3">
            {(stats?.charts.topCourses ?? []).map((c, i) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {c.title}
                  </p>
                  <p className="text-xs text-gray-500">{c.shortName}</p>
                </div>
                <div className="text-sm font-semibold text-sky-600">
                  {c.enrollments}
                </div>
              </div>
            ))}
            {!stats?.charts.topCourses?.length && (
              <p className="text-sm text-gray-400 text-center py-4">
                Hozircha ma'lumot yo'q
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" /> Eng ko'p tanga to'plagan
          </h3>
          <div className="space-y-3">
            {(stats?.lists.topUsersByCoins ?? []).map((u) => (
              <Link
                href={`/users/${u.id}`}
                key={u.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-xs font-semibold">
                  {(u.name?.[0] ?? "?") + (u.surname?.[0] ?? "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {u.name} {u.surname}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                  <Coins className="w-4 h-4" /> {u.coins}
                </div>
              </Link>
            ))}
            {!stats?.lists.topUsersByCoins?.length && (
              <p className="text-sm text-gray-400 text-center py-4">
                Hozircha ma'lumot yo'q
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" /> Oxirgi sertifikatlar
          </h3>
          <div className="space-y-3">
            {(stats?.lists.recentCertificates ?? []).map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {c.user.name} {c.user.surname}
                  </p>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {c.score}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.course.title}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(c.issuedAt).toLocaleDateString("uz-UZ")}
                </p>
              </div>
            ))}
            {!stats?.lists.recentCertificates?.length && (
              <p className="text-sm text-gray-400 text-center py-4">
                Hozircha sertifikatlar yo'q
              </p>
            )}
          </div>
        </div>
      </section>

      {/* User list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Foydalanuvchilar ro'yxati
          </h2>
          <span className="text-sm text-gray-500">
            {filteredUsers.length} / {users.length}
          </span>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Ism, familiya yoki email orqali qidirish..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const createdDate = new Date(user.createdAt);
            const isNew =
              (Date.now() - createdDate.getTime()) / (1000 * 3600 * 24) < 7;

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
                        {user.name?.[0]}
                        {user.surname?.[0]}
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

                    <div className="flex items-center gap-3 mt-4 text-xs flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full font-medium ${
                          user.role === "ADMIN"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
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
                      Qo'shilgan: {createdDate.toLocaleDateString("uz-UZ")}
                    </p>
                  </div>

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
                      <MessageSquare className="w-4 h-4" /> SMS jo'natish
                    </div>
                    <Link
                      href={`/addmember/${user.email}`}
                      className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GraduationCap className="w-4 h-4" /> Kursga qo'shish
                    </Link>
                    <div className="px-5 py-3 hover:bg-red-50 flex items-center gap-3 cursor-pointer text-red-600 border-t">
                      <Trash2 className="w-4 h-4" /> O'chirish
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
      </section>
    </div>
  );
};

export default Page;
