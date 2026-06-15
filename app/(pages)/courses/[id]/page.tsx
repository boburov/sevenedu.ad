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

// 🎬 Video havolasini tahlil qilish (Vimeo / YouTube / to'g'ridan-to'g'ri fayl)
type VideoKind = "vimeo" | "youtube" | "file" | "none";
const parseVideo = (raw: string): { kind: VideoKind; embed?: string } => {
  const url = (raw || "").trim();
  if (!url) return { kind: "none" };

  // Vimeo: vimeo.com/123, vimeo.com/123/hash, player.vimeo.com/video/123?h=hash
  if (url.includes("vimeo.com")) {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
    if (m) {
      const id = m[1];
      let hash = m[2];
      if (!hash) {
        const hp = url.match(/[?&]h=(\w+)/);
        if (hp) hash = hp[1];
      }
      return {
        kind: "vimeo",
        embed: `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`,
      };
    }
  }

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) return { kind: "youtube", embed: `https://www.youtube.com/embed/${yt[1]}` };

  return { kind: "file" };
};

const VideoPlayer = ({
  url,
  className = "",
}: {
  url: string;
  className?: string;
}) => {
  const info = parseVideo(url);
  if (info.kind === "none") return null;

  if (info.kind === "vimeo" || info.kind === "youtube") {
    return (
      <div className={`relative w-full aspect-video ${className}`}>
        <iframe
          src={info.embed}
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return <video src={url} controls className={`rounded-lg w-full ${className}`} />;
};

const LessonsPage = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
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
      setFilePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  const resetForm = () => {
    setTitle("");
    setVideoUrl("");
    setFile(null);
    setFilePreview(null);
    setIsDemo(false);
    setIsVisible(true);
    setEditMode(false);
    setEditId(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return alert("Dars nomi kiritilishi shart!");
    if (!editMode && !videoUrl.trim() && !file)
      return alert("Video URL (Vimeo) yoki video fayl kiriting!");

    setLoading(true);
    try {
      if (editMode && editId) {
        // ✏️ Tahrirlash: URL va/yoki yangi fayl
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("isDemo", String(isDemo));
        formData.append("isVisible", String(isVisible));
        if (videoUrl.trim()) formData.append("videoUrl", videoUrl.trim());
        if (file) formData.append("video", file);
        await updateLesson(editId, formData);
        alert("Dars tahrirlandi!");
      } else if (file) {
        // 📤 Fayl yuklab yangi dars (eski usul)
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("isDemo", String(isDemo));
        formData.append("isVisible", String(isVisible));
        formData.append("video", file);
        await api.post(`/courses/${courseId}/lesson`, formData, {
          onUploadProgress: (e: AxiosProgressEvent) => {
            const percent = Math.round(((e.loaded || 0) * 100) / (e.total || 1));
            setUploadProgress(percent);
          },
        });
        alert("Dars qo‘shildi!");
      } else {
        // 🔗 Vimeo URL bilan yangi dars
        await api.post(`/courses/${courseId}/lesson`, {
          title: title.trim(),
          videoUrl: videoUrl.trim(),
          isDemo,
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
    if (!confirm("Ushbu darsni o‘chirmoqchimisiz?")) return;
    await deleteLesson(lessonId);
    fetchLessons();
  };

  const handleEdit = (lesson: Lesson) => {
    setTitle(lesson.title);
    setVideoUrl(lesson.videoUrl || "");
    setIsDemo(lesson.isDemo);
    setIsVisible(lesson.isVisible);
    setEditId(lesson.id);
    setEditMode(true);
    setFile(null);
    setFilePreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <h2 className="text-2xl font-semibold mb-1">
          📚 Dars qo‘shish / tahrirlash
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Vimeo havolasini joylang yoki video fayl yuklang.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* VIDEO URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (Vimeo / YouTube / to‘g‘ridan-to‘g‘ri havola)
            </label>
            <input
              type="text"
              placeholder="https://vimeo.com/123456789"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* URL PREVIEW */}
          {!file && videoUrl.trim() && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Ko‘rinish:</p>
              <VideoPlayer url={videoUrl} />
            </div>
          )}

          {/* FILE UPLOAD (ixtiyoriy) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yoki video fayl yuklash (ixtiyoriy)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {filePreview && (
            <video src={filePreview} controls className="rounded-lg w-full" />
          )}

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 h-4 rounded">
              <div
                className="bg-sky-500 h-4 text-white text-xs text-center rounded"
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
            className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
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

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded transition"
            >
              {editMode ? "Tahrirlash" : "Qo‘shish"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 bg-gray-200 hover:bg-gray-300 rounded transition"
              >
                Bekor qilish
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LESSONS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sky-700">{lesson.title}</h4>
              <div className="flex gap-1 flex-shrink-0">
                {lesson.isDemo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    Demo
                  </span>
                )}
                {!lesson.isVisible && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                    Yashirin
                  </span>
                )}
              </div>
            </div>

            <VideoPlayer url={lesson.videoUrl} />

            {lesson.videoUrl && (
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 truncate hover:text-sky-600"
                title={lesson.videoUrl}
              >
                {lesson.videoUrl}
              </a>
            )}

            <div className="flex justify-between mt-auto pt-2 border-t">
              <button
                onClick={() => handleEdit(lesson)}
                className="text-blue-600 hover:underline"
              >
                ✏️ Tahrirlash
              </button>
              <button
                onClick={() => handleDelete(lesson.id)}
                className="text-red-600 hover:underline"
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
