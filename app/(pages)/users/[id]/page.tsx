"use client";

import { useEffect, useState } from "react";
import {
  addMemeberToCourse,
  allCourse,
  getUserById,
} from "@/app/api/service/api";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Course {
  id: string;
  name: string;
  goal: string;
  thumbnail: string;
  price?: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
}

type SubscriptionType = "FULL_CHARGE" | "MONTHLY";

const Page = () => {
  const path = useParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionType>("FULL_CHARGE");
  const [userLoading, setUserLoading] = useState(true);

  // User ID ni olish
  const userId = decodeURIComponent(String(path.userId || path.id));
  console.log("User ID:", userId);

  useEffect(() => {
    // User ma'lumotlarini olish
    const fetchUserData = async () => {
      if (!userId) {
        setUserLoading(false);
        toast.error("Foydalanuvchi ID si topilmadi");
        return;
      }

      try {
        // getUserById orqali user ma'lumotlarini olish
        const userRes = await getUserById(userId);
        console.log("User ma'lumotlari:", userRes);

        // API response strukturasi qanday ekanligiga qarab
        const userData = userRes.data || userRes;

        if (userData && userData.email) {
          setUser({
            id: userData.id || userId,
            email: userData.email,
            name: userData.name || "Ism mavjud emas",
            surname: userData.surname || "Familiya mavjud emas",
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
    };

    fetchUserData();
  }, [userId]);

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

  const handleAddMember = async (courseId: string) => {
    if (!user?.email) {
      toast.error("Foydalanuvchi emaili topilmadi");
      return;
    }

    console.log(
      "User Email:",
      user.email,
      "Course ID:",
      courseId,
      "Subscription:",
      selectedSubscription
    );
    setAddingCourseId(courseId);

    try {
      await addMemeberToCourse(user.email, courseId, selectedSubscription);
      toast.success("Foydalanuvchi kursga muvaffaqiyatli qo'shildi!");
    } catch (error: unknown) {
      console.error(error);
      toast.error((error as Error)?.message || "Qo'shishda xatolik yuz berdi");
    } finally {
      setAddingCourseId(null);
    }
  };

  const subscriptionOptions = [
    {
      value: "FULL_CHARGE" as SubscriptionType,
      label: "📦 To&apos;liq to&apos;lov",
      description: "Bir martalik to&apos;liq to&apos;lov",
    },
    {
      value: "MONTHLY" as SubscriptionType,
      label: "📅 Oylik obuna",
      description: "Har oy to&apos;lov",
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
        <h1 className="text-3xl font-bold text-gray-800">{`Kurslarga Qo'shish`}</h1>
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
                  alt={course.name}
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/400/200";
                  }}
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                  {course.name}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {course.goal}
                </p>

                {course.price && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Narx:</span>
                    <span className="font-semibold text-green-600">
                      {course.price.toLocaleString()} so&apos;m
                    </span>
                  </div>
                )}

                <div className="pt-2">
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
                      `➕ ${selectedSubscription === "FULL_CHARGE" ? "To&apos;liq to&apos;lov" : "Oylik obuna"} bilan qo&apos;shilish`
                    )}
                  </button>

                  {selectedSubscription === "MONTHLY" && course.price && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Oylik to&apos;lov:{" "}
                      {Math.round(course.price / 12).toLocaleString()} so&apos;m
                    </p>
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
