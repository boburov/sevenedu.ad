"use client";

import { AxiosProgressEvent } from "axios";
import api, {
  deleteLesson,
  getLessons,
  updateLesson,
} from "@/app/api/service/api";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  isDemo: boolean;
  isVisible: boolean;
}

// 🔒 maxsus kurs ID
const SPECIAL_COURSE_ID = "a06d565b-1d61-4564-af5d-1ceb4cfb3f6b";

const LessonsPage = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { id: courseId } = useParams() as { id: string };

  // 📥 darslarni olish
  const fetchLessons = useCallback(async () => {
    setLoading(true);

    const res = await getLessons(courseId);
    const dataLessons: Lesson[] = res.data.lessons || [];

    let finalLessons = dataLessons;

    // 👉 faqat shu kursda 25–64 olib tashlanadi
    if (courseId === SPECIAL_COURSE_ID) {
      finalLessons = [
        ...dataLessons.slice(0, 24), // 1–24
        ...dataLessons.slice(64), // 65+
      ];
    }

    setLessons(finalLessons);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setVideoPreview(null);
    }
  }, [file]);

  const resetForm = () => {
    setTitle("");
    setFile(null);
    setVideoPreview(null);
    setIsDemo(false);
    setIsVisible(true);
    setEditMode(false);
    setEditId(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) return alert("Dars nomi kiritilishi shart!");
    if (!file && !editMode) return alert("Video yuklash shart!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("isDemo", String(isDemo));
    formData.append("isVisible", String(isVisible));
    if (file) formData.append("video", file);

    setLoading(true);
    try {
      if (editMode && editId) {
        await updateLesson(editId, formData);
        alert("Dars tahrirlandi!");
      } else {
        await api.post(`/courses/${courseId}/lesson`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          onUploadProgress: (e: AxiosProgressEvent) => {
            const percent = Math.round(
              ((e.loaded || 0) * 100) / (e.total || 1)
            );
            setUploadProgress(percent);
          },
        });
        alert("Dars qo‘shildi!");
      }

      resetForm();
      fetchLessons();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    await deleteLesson(lessonId);
    fetchLessons();
  };

  const handleEdit = (lesson: Lesson) => {
    setTitle(lesson.title);
    setIsDemo(lesson.isDemo);
    setIsVisible(lesson.isVisible);
    setEditId(lesson.id);
    setEditMode(true);
    setFile(null);
    setVideoPreview(lesson.videoUrl);
  };

  return (
    <div className="px-4 py-10 lg:px-10 w-full min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-t-transparent border-white rounded-full animate-spin" />
        </div>
      )}

      {/* FORM */}
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">
          📚 Dars qo‘shish / tahrirlash
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {videoPreview && (
            <video src={videoPreview} controls className="rounded-lg w-full" />
          )}

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 h-4 rounded">
              <div
                className="bg-sky-500 h-4 text-white text-xs text-center"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          )}

          <input
            type="text"
            placeholder="Dars nomi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border rounded"
          />

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
            />
            Demo dars
          </label>

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            Ko‘rinadi
          </label>

          <button
            type="submit"
            className="w-full py-3 bg-sky-500 text-white rounded"
          >
            {editMode ? "Tahrirlash" : "Qo‘shish"}
          </button>
        </form>
      </div>

      {/* LESSONS */}
      <div className="grid md:grid-cols-4 gap-6 mt-10">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-3"
          >
            <h4 className="font-bold text-sky-700">{lesson.title}</h4>

            {lesson.videoUrl && (
              <video src={lesson.videoUrl} controls className="rounded" />
            )}

            <div className="flex justify-between">
              <button
                onClick={() => handleEdit(lesson)}
                className="text-blue-600"
              >
                ✏️ Tahrirlash
              </button>
              <button
                onClick={() => handleDelete(lesson.id)}
                className="text-red-600"
              >
                🗑️ O‘chirish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonsPage;
