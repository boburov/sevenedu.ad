"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addMemeberToCourse,
  allCourse,
  getUserById,
  removeCourseFromUser,
  updateUserProfilePic,
  deleteUserProfilePic,
} from "@/app/api/service/api";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

interface Course {
  id: string;
  title: string;
  goal: string;
  thumbnail: string;
}

type SubscriptionType = "FULL_CHARGE" | "MONTHLY";

interface Enrollment {
  courseId: string;
  subscription: SubscriptionType | "FREE";
  joinedAt: string;
  course?: { title?: string; thumbnail?: string };
}

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  profilePic?: string;
  courses: Enrollment[];
}

const subscriptionLabel: Record<Enrollment["subscription"], string> = {
  FULL_CHARGE: "📦 To'liq to'lov",
  MONTHLY: "📅 Oylik obuna",
  FREE: "🎁 Bepul",
};

const Page = () => {
  const path = useParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionType>("FULL_CHARGE");
  const [userLoading, setUserLoading] = useState(true);
  const [pfpUploading, setPfpUploading] = useState(false);

  // User ID ni olish
  const userId = decodeURIComponent(String(path.userId || path.id));

  // User ma'lumotlarini (biriktirilgan kurslari bilan) olish
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setUserLoading(false);
      toast.error("Foydalanuvchi ID si topilmadi");
      return;
    }

    try {
      const userRes = await getUserById(userId);
      const userData = userRes.data || userRes;

      if (userData && userData.email) {
        setUser({
          id: userData.id || userId,
          email: userData.email,
          name: userData.name || "Ism mavjud emas",
          surname: userData.surname || "Familiya mavjud emas",
          profilePic: userData.profilePic || "",
          courses: Array.isArray(userData.courses) ? userData.courses : [],
        });
      } else {
        toast.error("Foydalanuvchi ma'lumotlarida email topilmadi");
      }
    } catch (error) {
      console.error("User ma'lumotlarini olishda xatolik:", error);
      toast.error("Foydalanuvchi ma'lumotlarini olishda xatolik");
    } finally {
      setUserLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    allCourse()
      .then((res) => {
        setCourses(res.data);
      })
      .catch((err) => {
        toast.error("Kurslarni olishda xatolik");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  // O'quvchi profil rasmini yangilash — fayl VPS'ga yuklanadi.
  const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // bir xil faylni qayta tanlash mumkin bo'lsin
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayl yuklash mumkin");
      return;
    }

    setPfpUploading(true);
    try {
      const updated = await updateUserProfilePic(user.id, file);
      const newUrl: string = updated?.profilePic || "";
      setUser((prev) => (prev ? { ...prev, profilePic: newUrl } : prev));
      toast.success("Profil rasmi yangilandi");
    } catch (error: unknown) {
      console.error(error);
      toast.error((error as Error)?.message || "Rasm yuklashda xatolik");
    } finally {
      setPfpUploading(false);
    }
  };

  const handlePfpDelete = async () => {
    if (!user) return;
    if (!confirm("Profil rasmini o'chirilsinmi?")) return;

    setPfpUploading(true);
    try {
      await deleteUserProfilePic(user.id);
      setUser((prev) => (prev ? { ...prev, profilePic: "" } : prev));
      toast.success("Profil rasmi o'chirildi");
    } catch (error: unknown) {
      console.error(error);
      toast.error((error as Error)?.message || "Rasmni o'chirishda xatolik");
    } finally {
      setPfpUploading(false);
    }
  };

  const handleAddMember = async (courseId: string) => {
    if (!user?.email) {
      toast.error("Foydalanuvchi emaili topilmadi");
      return;
    }

    setAddingCourseId(courseId);

    try {
      await addMemeberToCourse(user.email, courseId, selectedSubscription);
      toast.success("Foydalanuvchi kursga muvaffaqiyatli qo'shildi!");
      await fetchUserData();
    } catch (error: unknown) {
      console.error(error);
      toast.error((error as Error)?.message || "Qo'shishda xatolik yuz berdi");
    } finally {
      setAddingCourseId(null);
    }
  };

  const handleRemoveCourse = async (courseId: string, title: string) => {
    if (!user) return;
    if (
      !confirm(
        `"${title}" kursini ${user.name} ${user.surname}dan olib tashlaysizmi?\n\nO'quvchi bu kursga kira olmaydi. Dars progressi saqlanib qoladi.`,
      )
    )
      return;

    setRemovingCourseId(courseId);
    try {
      await removeCourseFromUser(user.id, courseId);
      toast.success("Kurs foydalanuvchidan olib tashlandi");
      setUser((u) =>
        u
          ? { ...u, courses: u.courses.filter((c) => c.courseId !== courseId) }
          : u,
      );
    } catch (error: unknown) {
      console.error(error);
      toast.error("Kursni olib tashlashda xatolik yuz berdi");
    } finally {
      setRemovingCourseId(null);
    }
  };

  const enrolledIds = new Set(user?.courses.map((c) => c.courseId) ?? []);
  const courseTitle = (e: Enrollment) =>
    e.course?.title ||
    courses.find((c) => c.id === e.courseId)?.title ||
    e.courseId;

  const subscriptionOptions = [
    {
      value: "FULL_CHARGE" as SubscriptionType,
      label: "📦 To'liq to'lov",
      description: "Bir martalik to'liq to'lov",
    },
    {
      value: "MONTHLY" as SubscriptionType,
      label: "📅 Oylik obuna",
      description: "Har oy to'lov",
    },
  ];

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 mt-2">
            {`Foydalanuvchi ma'lumotlari yuklanmoqda...`}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Foydalanuvchi topilmadi</p>
          <p className="text-gray-500 mt-2">ID: {userId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Foydalanuvchi</h1>
        {user && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
            <p className="text-gray-700">
              <strong>Foydalanuvchi:</strong> {user.name} {user.surname}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-gray-600 text-sm">
              <strong>ID:</strong> {user.id}
            </p>
          </div>
        )}
      </div>

      {/* Profil rasmi (pfp) — yangisi VPS'ga yuklanadi */}
      {user && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🖼️ Profil rasmi
          </h3>
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
              {user.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profilePic}
                  alt="Profil rasmi"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                  {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
                </div>
              )}
              {pfpUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                className={`inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  pfpUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {user.profilePic ? "Rasmni almashtirish" : "Rasm yuklash"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={pfpUploading}
                  onChange={handlePfpChange}
                />
              </label>

              {user.profilePic && (
                <button
                  type="button"
                  onClick={handlePfpDelete}
                  disabled={pfpUploading}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  O&apos;chirish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Biriktirilgan kurslar */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📚 Biriktirilgan kurslar ({user.courses.length})
        </h3>
        {user.courses.length === 0 ? (
          <p className="text-sm text-gray-500">
            Hozircha hech qanday kurs biriktirilmagan.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {user.courses.map((e) => {
              const title = courseTitle(e);
              return (
                <li
                  key={e.courseId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {subscriptionLabel[e.subscription] ?? e.subscription} ·{" "}
                      {new Date(e.joinedAt).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(e.courseId, title)}
                    disabled={removingCourseId === e.courseId}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {removingCourseId === e.courseId
                      ? "Olinmoqda..."
                      : "Olib tashlash"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Obuna turini tanlash */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Obuna turini tanlang
        </h3>
        <div className="space-y-3">
          {subscriptionOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedSubscription === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value={option.value}
                checked={selectedSubscription === option.value}
                onChange={(e) =>
                  setSelectedSubscription(e.target.value as SubscriptionType)
                }
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-800">{option.label}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 mt-2">Kurslar yuklanmoqda...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Hozircha kurslar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-all duration-300 p-5 space-y-4"
            >
              <div className="relative h-40 rounded-xl overflow-hidden">
                <img
                  src={course.thumbnail || "/api/placeholder/400/200"}
                  alt={course.title}
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/400/200";
                  }}
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                  {course.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {course.goal}
                </p>

                <div className="pt-2">
                  {enrolledIds.has(course.id) ? (
                    <div className="w-full px-4 py-3 rounded-lg font-medium text-center bg-green-50 text-green-700 border border-green-200">
                      ✓ Biriktirilgan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddMember(course.id)}
                      disabled={addingCourseId === course.id}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                        addingCourseId === course.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {addingCourseId === course.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Qo&apos;shilmoqda...
                        </span>
                      ) : (
                        `➕ ${selectedSubscription === "FULL_CHARGE" ? "To'liq to'lov" : "Oylik obuna"} bilan qo'shish`
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
