"use client";

import { useEffect, useState } from "react";
import * as tus from "tus-js-client";
import {
  createMovieVimeoUploadTicket,
  allCourse,
  moviesByCourse,
  createMovie,
  updateMovie,
  deleteMovie,
} from "@/app/api/service/api";
import { FileUp, Trash, Pencil, X, Film } from "lucide-react";
import { toast } from "react-toastify";

interface CourseType {
  id: string;
  title: string;
  shortName: string;
}

interface MovieType {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  posterUrl: string;
  videoUrl: string;
  order: number;
}

const MoviesPage = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [courseId, setCourseId] = useState("");
  const [movies, setMovies] = useState<MovieType[]>([]);

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [poster, setPoster] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetForm = () => {
    setTitle("");
    setVideoUrl("");
    setDescription("");
    setOrder("");
    setPoster(null);
    setPreview(null);
    setEditingId(null);
    setVideoFile(null);
    setUploadProgress(0);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await allCourse();
        const list: CourseType[] = res.data || [];
        setCourses(list);
        if (list.length && !courseId) setCourseId(list[0].id);
      } catch (err) {
        toast.error("Kurslarni yuklab bo'lmadi: " + err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMovies = async (cid: string) => {
    if (!cid) return;
    try {
      const res = await moviesByCourse(cid);
      setMovies(res.data || []);
    } catch (err) {
      toast.error("Kinolarni yuklab bo'lmadi: " + err);
    }
  };

  useEffect(() => {
    if (courseId) fetchMovies(courseId);
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (poster) {
      const url = URL.createObjectURL(poster);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [poster]);

  // 📤 Kino faylini to'g'ridan-to'g'ri Vimeo'ga (tus) yuklaydi va kanonik
  // Vimeo havolasini qaytaradi. Fayl server orqali o'tmaydi.
  const uploadFileToVimeo = (f: File, name: string): Promise<string> =>
    new Promise((resolve, reject) => {
      createMovieVimeoUploadTicket(f.size, name)
        .then((ticket) => {
          const upload = new tus.Upload(f, {
            uploadUrl: ticket.uploadLink,
            retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
            metadata: { filename: f.name, filetype: f.type },
            onProgress: (uploaded, total) =>
              setUploadProgress(
                total ? Math.max(1, Math.round((uploaded / total) * 100)) : 1,
              ),
            onSuccess: () => resolve(ticket.videoLink),
            onError: (error) => reject(error),
          });
          upload.start();
        })
        .catch(reject);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return toast.error("Avval kursni tanlang");
    if (!title.trim() || (!videoUrl.trim() && !videoFile)) {
      return toast.error("Nom va video havolasi (yoki fayl) kiriting");
    }

    setLoading(true);
    try {
      // Fayl tanlangan bo'lsa — avval Vimeo'ga yuklab, havolasini olamiz
      let finalVideoUrl = videoUrl.trim();
      if (videoFile) {
        setUploadProgress(1);
        finalVideoUrl = await uploadFileToVimeo(videoFile, title.trim());
      }

      const fd = new FormData();
      fd.append("courseId", courseId);
      fd.append("title", title.trim());
      fd.append("videoUrl", finalVideoUrl);
      if (description.trim()) fd.append("description", description.trim());
      if (order.trim()) fd.append("order", String(Number(order) || 0));
      if (poster) fd.append("poster", poster);

      if (editingId) await updateMovie(editingId, fd);
      else await createMovie(fd);
      toast.success(`Kino ${editingId ? "yangilandi" : "qo'shildi"}`);
      resetForm();
      fetchMovies(courseId);
    } catch (err) {
      toast.error("Xatolik: " + err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (m: MovieType) => {
    setEditingId(m.id);
    setTitle(m.title);
    setVideoUrl(m.videoUrl);
    setDescription(m.description || "");
    setOrder(String(m.order ?? 0));
    setPreview(m.posterUrl || null);
    setPoster(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kino o'chirilsinmi?")) return;
    try {
      await deleteMovie(id);
      toast.success("O'chirildi");
      fetchMovies(courseId);
    } catch (err) {
      toast.error("Xatolik: " + err);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-semibold tracking-tight">Kinolar</h1>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="border rounded-lg px-4 py-2 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}: {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId ? "Kinoni tahrirlash" : "Yangi kino"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
              >
                <X size={16} /> Bekor
              </button>
            )}
          </div>

          {/* POSTER */}
          <label className="cursor-pointer block">
            <div className="border border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition">
              {preview ? (
                <img
                  src={preview}
                  className="mx-auto h-40 object-contain rounded-lg"
                />
              ) : (
                <>
                  <FileUp className="mx-auto mb-2 text-gray-400" size={36} />
                  <p className="text-sm text-gray-500">Poster (ixtiyoriy)</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPoster(e.target.files?.[0] || null)}
            />
          </label>

          <input
            type="text"
            placeholder="Kino nomi"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Vimeo (yoki MP4) havolasi"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={!!videoFile}
          />

          {/* VIDEO FAYL — to'g'ridan Vimeo'ga yuklanadi */}
          <div className="rounded-xl border border-dashed p-4 space-y-2">
            <p className="text-sm text-gray-600">
              Yoki kino faylini yuklash (Vimeo&apos;ga yuklanadi, havola
              avtomatik olinadi)
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                <Film size={16} />
                {videoFile ? "Boshqa fayl tanlash" : "Video fayl tanlash"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={loading}
                  onChange={(e) => {
                    setVideoFile(e.target.files?.[0] || null);
                    e.target.value = "";
                  }}
                />
              </label>
              {videoFile && (
                <>
                  <span className="text-sm text-gray-700 truncate max-w-[16rem]">
                    {videoFile.name} (
                    {(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="text-sm text-gray-500 hover:text-gray-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
            {uploadProgress > 0 && (
              <div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Vimeo&apos;ga yuklanmoqda… {uploadProgress}% — sahifani
                  yopmang
                </p>
              </div>
            )}
          </div>
          <textarea
            placeholder="Tavsif (ixtiyoriy)"
            className="w-full border rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Tartib raqami (0, 1, 2...)"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition disabled:opacity-60"
          >
            {loading
              ? uploadProgress > 0
                ? `Yuklanmoqda... ${uploadProgress}%`
                : "Saqlanmoqda..."
              : editingId
                ? "Kinoni yangilash"
                : "Kino qo'shish"}
          </button>
        </form>

        {/* LIST */}
        <div>
          <h2 className="text-xl font-medium mb-4">
            Kinolar ({movies.length})
          </h2>
          {movies.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Bu kursda hozircha kino yo&apos;q.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((m) => (
                <div
                  key={m.id}
                  className="border rounded-2xl overflow-hidden hover:shadow-md transition"
                >
                  <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                    {m.posterUrl ? (
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="text-gray-400" size={40} />
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-semibold">
                      {m.order}. {m.title}
                    </h3>
                    <p className="text-xs text-gray-400 break-all line-clamp-1">
                      {m.videoUrl}
                    </p>
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => handleEdit(m)}
                        className="flex items-center gap-1 text-amber-600 hover:underline"
                      >
                        <Pencil size={16} /> Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="flex items-center gap-1 text-red-500 hover:underline"
                      >
                        <Trash size={16} /> O&apos;chirish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviesPage;
