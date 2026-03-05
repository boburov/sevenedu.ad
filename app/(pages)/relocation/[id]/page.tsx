'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Play, Eye, BookOpen, Clock, BarChart3, AlertCircle, Home, GripVertical, Save } from "lucide-react";
import { GetCourseById } from "@/app/api/service/api";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  isDemo: boolean;
  videoUrl: string;
  isVisible: boolean;
  coursesCategoryId: string;
  duration?: number;
  orderNumber?: number;
  order: number;
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function LessonsPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError("Kurs IDsi topilmadi");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Kurs ID:", id);

        // API chaqiruvi
        const response = await GetCourseById(id as string);
        console.log("API Javobi:", response);

        if (response && response.data) {
          setCourse(response.data);
          // Darslarni tartib raqami bo'yicha saralash
          const sortedLessons = response.data.lessons
            ?.filter((lesson: Lesson) => lesson.isVisible)
            .sort((a: Lesson, b: Lesson) => (a.order || 0) - (b.order || 0)) || [];
          setLessons(sortedLessons);
          setOriginalOrder(sortedLessons.map((lesson: Lesson) => lesson.id));
        } else {
          setError("Kurs ma'lumotlari topilmadi");
        }
      } catch (err) {
        console.error("API xatosi:", err);
        setError("Kurs yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleDragStart = (e: React.DragEvent, lessonId: string) => {
    e.dataTransfer.setData("text/plain", lessonId);
    setDraggingId(lessonId);
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent, lessonId: string) => {
    e.preventDefault();
    setDragOverId(lessonId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetLessonId: string) => {
    e.preventDefault();
    const draggedLessonId = e.dataTransfer.getData("text/plain");

    if (draggedLessonId !== targetLessonId) {
      const draggedIndex = lessons.findIndex(lesson => lesson.id === draggedLessonId);
      const targetIndex = lessons.findIndex(lesson => lesson.id === targetLessonId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newLessons = [...lessons];
        const [draggedItem] = newLessons.splice(draggedIndex, 1);
        newLessons.splice(targetIndex, 0, draggedItem);

        // Yangi tartib raqamlarini yangilash
        const updatedLessons = newLessons.map((lesson, index) => ({
          ...lesson,
          order: index + 1
        }));

        setLessons(updatedLessons);
        setHasChanges(true);
        console.log("Yangi tartib:", updatedLessons);
      }
    }

    setDraggingId(null);
    setDragOverId(null);
    e.currentTarget.classList.remove("border-purple-400");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingId(null);
    setDragOverId(null);
    e.currentTarget.classList.remove("opacity-50");
  };

  // API ga yangi tartibni saqlash funksiyasi
  const updateLessonOrder = async (lessons: Lesson[]) => {
    if (!course) return;

    setIsSaving(true);
    try {
      console.log("Tartib yangilanmoqda:", lessons);

      // API ga yuborish uchun format
      const reorderData = lessons.map((lesson, index) => ({
        lessonId: lesson.id,
        newIndex: index
      }));

      console.log("API ga yuboriladigan ma'lumot:", reorderData);

      // API ga so'rov yuborish
      const response = await fetch(`https://api.sevenedu.store/courses/${course.id}/reorder-lessons`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reorderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP xato! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API javobi:", result);

      alert("Tartib muvaffaqiyatli yangilandi!");
      setHasChanges(false);
      setOriginalOrder(lessons.map(lesson => lesson.id));

    } catch (error) {
      console.error('Tartibni yangilashda xatolik:', error);
      alert("Tartibni yangilashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  // Tartibni qayta tiklash
  const resetOrder = () => {
    const originalLessons = [...lessons].sort((a, b) => {
      const aIndex = originalOrder.indexOf(a.id);
      const bIndex = originalOrder.indexOf(b.id);
      return aIndex - bIndex;
    }).map((lesson, index) => ({ ...lesson, order: index + 1 }));

    setLessons(originalLessons);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Darslar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-4">Xatolik</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Qayta urinish
            </button>
            <Link
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Bosh sahifa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Kurs topilmadi</h1>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section with Save Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center justify-center p-3 bg-purple-900/20 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">{course.title}</h1>
            <p className="text-gray-400 text-lg">
              {lessons.length} ta dars mavjud
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Darslarni tartibini o&apos;zgartirish uchun <GripVertical className="inline h-4 w-4" /> belgisini tutib sudrab siljiting
            </p>
          </div>

          {/* Save Button - Top Right Corner */}
          <div className="flex flex-col sm:flex-row gap-3">
            {hasChanges && (
              <button
                onClick={resetOrder}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Bekor Qilish
              </button>
            )}
            <button
              onClick={() => updateLessonOrder(lessons)}
              disabled={isSaving || !hasChanges}
              className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors text-sm ${isSaving
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : !hasChanges
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Tartibni Saqlash
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lessons Grid */}
        {lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                draggable
                onDragStart={(e) => handleDragStart(e, lesson.id)}
                onDragOver={(e) => handleDragOver(e, lesson.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, lesson.id)}
                onDragEnd={handleDragEnd}
                className={`relative group bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border ${draggingId === lesson.id
                    ? 'border-purple-500 opacity-50'
                    : dragOverId === lesson.id
                      ? 'border-purple-400 bg-gray-700'
                      : 'border-gray-700 hover:-translate-y-2'
                  }`}
                onMouseEnter={() => setHoveredLesson(lesson.id)}
                onMouseLeave={() => setHoveredLesson(null)}
              >
                {/* Drag handle */}
                <div
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gray-900/80 flex items-center justify-center cursor-grab z-10 hover:bg-gray-800 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>

                {/* Video Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  {lesson.videoUrl ? (
                    <>
                      <video
                        className="w-full h-full object-cover"
                        src={lesson.videoUrl}
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-70"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-16 h-16 rounded-full bg-purple-600/90 flex items-center justify-center transition-transform duration-300 ${hoveredLesson === lesson.id ? 'scale-110' : 'scale-100'}`}>
                          <Play className="h-8 w-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center">
                      <Play className="h-16 w-16 text-purple-400/50" />
                    </div>
                  )}

                  {/* Demo Badge */}
                  {lesson.isDemo && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      DEMO
                    </div>
                  )}

                  {/* Lesson Number */}
                  <div className="absolute top-3 left-12 w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{lesson.order}</span>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {lesson.title}
                  </h3>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{lesson.duration ? `${Math.round(lesson.duration / 60)} min` : 'Noma&apos;lum'}</span>
                    </div>

                    <Link
                      href={`/${course.id}/${lesson.id}`}
                      className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ko&apos;rish
                    </Link>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/50 rounded-2xl border border-gray-700">
            <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">
              {course.lessons?.length > 0 ?
                "Hech qanday ko'rinadigan dars mavjud emas" :
                "Darslar hali mavjud emas"}
            </h2>
            <p className="text-gray-500">
              {course.lessons?.length > 0 ?
                "Barcha darslar yashirin holatda" :
                "Tez orada yangi darslar qo'shiladi"}
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span className="mr-2">←</span>
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
