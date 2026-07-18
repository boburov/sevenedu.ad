"use client";

import * as tus from "tus-js-client";
import api, {
  deleteLesson,
  getLessons,
  updateLesson,
  getCourseLevels,
  upsertCourseLevel,
  insertLessons,
  createVimeoUploadTicket,
} from "@/app/api/service/api";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePermissions } from "@/app/lib/permissions";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  isDemo: boolean;
  isVisible: boolean;
  level?: string | null;
}

// CEFR darajalar
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

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
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Qo'shish joyi: "" = eng oxiriga, "__start__" = eng boshiga, aks holda lessonId (shundan keyin)
  const [insertAfter, setInsertAfter] = useState<string>("");

  const { can, ready: permsReady } = usePermissions();
  const canCreate = can("lessons", "create");
  const canEdit = can("lessons", "edit");
  const canDelete = can("lessons", "delete");
  const canEditCourse = can("courses", "edit");

  // Modul (CEFR daraja) nomlari
  const [levelMetas, setLevelMetas] = useState<
    Record<string, { title: string; description: string }>
  >({});
  const [savingLevel, setSavingLevel] = useState<string | null>(null);

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

  // 📥 modul (daraja) nomlarini olish
  const fetchLevels = useCallback(async () => {
    try {
      const res = await getCourseLevels(courseId);
      const map: Record<string, { title: string; description: string }> = {};
      (res.data || []).forEach(
        (m: { level: string; title?: string; description?: string }) => {
          map[m.level] = {
            title: m.title || "",
            description: m.description || "",
          };
        }
      );
      setLevelMetas(map);
    } catch {
      /* meta hali yo'q — e'tibor bermaymiz */
    }
  }, [courseId]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const setLevelField = (
    lvl: string,
    field: "title" | "description",
    value: string
  ) =>
    setLevelMetas((prev) => ({
      ...prev,
      [lvl]: {
        title: prev[lvl]?.title || "",
        description: prev[lvl]?.description || "",
        [field]: value,
      },
    }));

  const saveLevel = async (lvl: string) => {
    const meta = levelMetas[lvl];
    if (!meta || !meta.title.trim()) {
      alert("Modul nomini kiriting");
      return;
    }
    setSavingLevel(lvl);
    try {
      await upsertCourseLevel(courseId, {
        level: lvl,
        title: meta.title.trim(),
        description: meta.description?.trim() || undefined,
      });
      await fetchLevels();
    } catch {
      alert("Saqlashda xatolik");
    } finally {
      setSavingLevel(null);
    }
  };

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
    setLevel("");
    setEditMode(false);
    setEditId(null);
    setUploadProgress(0);
    setInsertAfter("");
  };

  // "+" tugmalar: qo'shish joyini belgilab, forma tepasiga ko'chiramiz
  const startInsertAt = (afterId: string) => {
    resetForm();
    setInsertAfter(afterId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 📤 Faylni to'g'ridan-to'g'ri Vimeo'ga (tus) yuklaydi va videoUrl (kanonik
  // Vimeo havolasi) qaytaradi. Fayl server orqali o'tmaydi.
  const uploadFileToVimeo = (f: File, name: string): Promise<string> =>
    new Promise((resolve, reject) => {
      createVimeoUploadTicket(f.size, name)
        .then((ticket) => {
          const upload = new tus.Upload(f, {
            uploadUrl: ticket.uploadLink, // server allaqachon videoni ochib bergan
            retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
            metadata: { filename: f.name, filetype: f.type },
            onProgress: (uploaded, total) =>
              setUploadProgress(
                total ? Math.round((uploaded / total) * 100) : 0
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

    if (!title.trim()) return alert("Dars nomi kiritilishi shart!");
    if (!editMode && !videoUrl.trim() && !file)
      return alert("Video URL (Vimeo) yoki video fayl kiriting!");

    setLoading(true);
    try {
      // Fayl tanlangan bo'lsa — avval Vimeo'ga yuklab, URL'ga aylantiramiz.
      // Shundan so'ng barcha holatlar (oxiriga / orasiga / tahrir) bir xil
      // videoUrl oqimidan o'tadi — fayl endi oddiy Vimeo havolasi.
      let finalVideoUrl = videoUrl.trim();
      if (file) {
        setUploadProgress(1);
        finalVideoUrl = await uploadFileToVimeo(file, title.trim());
      }

      if (editMode && editId) {
        // ✏️ Tahrirlash: URL yoki yangi (Vimeo'ga yuklangan) video
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("isDemo", String(isDemo));
        formData.append("isVisible", String(isVisible));
        if (level) formData.append("level", level);
        if (finalVideoUrl) formData.append("videoUrl", finalVideoUrl);
        await updateLesson(editId, formData);
        alert("Dars tahrirlandi!");
      } else if (insertAfter === "") {
        // 🔗 Oxiriga qo'shish
        await api.post(`/courses/${courseId}/lesson`, {
          title: title.trim(),
          videoUrl: finalVideoUrl,
          isDemo,
          ...(level ? { level } : {}),
        });
        alert("Dars qo‘shildi!");
      } else {
        // 🎯 Ma'lum joyga (ikki dars orasiga / boshiga) qo'shish
        const afterId = insertAfter === "__start__" ? null : insertAfter;
        await insertLessons(courseId, afterId, [
          {
            title: title.trim(),
            videoUrl: finalVideoUrl,
            isDemo,
            ...(level ? { level } : {}),
          },
        ]);
        alert("Dars kerakli joyga qo‘shildi!");
      }

      resetForm();
      fetchLessons();
    } catch (err) {
      console.error(err);
      alert(
        typeof err === "string"
          ? err
          : "Xatolik yuz berdi. Vimeo tokeni (upload+edit scope) yoki internet aloqasini tekshiring."
      );
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
    setLevel(lesson.level || "");
    setEditId(lesson.id);
    setEditMode(true);
    setFile(null);
    setFilePreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 py-10 lg:px-10 w-full min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 border-4 border-t-transparent border-white rounded-full animate-spin" />
          {uploadProgress > 0 && (
            <div className="w-72 max-w-[80%] text-center">
              <div className="w-full bg-white/25 h-3 rounded overflow-hidden">
                <div
                  className="bg-sky-400 h-3 rounded transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-white text-sm mt-2">
                Vimeo‘ga yuklanmoqda… {uploadProgress}%
              </p>
              <p className="text-white/60 text-xs mt-1">
                Katta fayllar biroz vaqt olishi mumkin — sahifani yopmang.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FORM — faqat dars qo'shish yoki tahrirlash ruxsati bo'lsa */}
      {permsReady && (canCreate || canEdit) && (
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-1">
          📚 Dars qo‘shish / tahrirlash
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Vimeo havolasini joylang yoki video fayl yuklang.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* QO'SHISH JOYI (faqat yangi dars uchun) */}
          {!editMode && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📍 Qo‘shish joyi
              </label>
              <select
                value={insertAfter}
                onChange={(e) => setInsertAfter(e.target.value)}
                className="w-full px-4 py-2.5 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">⤓ Eng oxiriga (odatiy)</option>
                <option value="__start__">⤒ Eng boshiga</option>
                {lessons.map((l, i) => (
                  <option key={l.id} value={l.id}>
                    {i + 1}. {l.title} — dan keyin
                  </option>
                ))}
              </select>
              {insertAfter !== "" && (
                <p className="text-xs text-sky-700 mt-1">
                  {insertAfter === "__start__"
                    ? "Yangi dars ro‘yxat boshiga qo‘shiladi."
                    : `Yangi dars tanlangan darsdan keyin qo‘shiladi.`}
                </p>
              )}
            </div>
          )}

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
              Yoki video fayl yuklash (Vimeo‘ga yuklanadi)
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

          {/* CEFR DARAJA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daraja (CEFR) — ixtiyoriy
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">— Darajasiz —</option>
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

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
              disabled={editMode ? !canEdit : !canCreate}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition"
            >
              {editMode ? "Tahrirlash" : "Qo‘shish"}
            </button>
            {(editMode || insertAfter !== "") && (
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
      )}

      {/* MODUL (CEFR DARAJA) NOMLARI — faqat kurs tahrirlash ruxsati bo'lsa */}
      {canEditCourse && (
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-1">🧩 Modul nomlari (CEFR)</h2>
        <p className="text-sm text-gray-500 mb-5">
          Har bir daraja uchun nom va qisqa tavsif. Bu nomlar mobil ilovada
          darslar ustida ko‘rinadi. Bo‘sh qoldirsangiz — standart nom
          ishlatiladi.
        </p>

        {CEFR_LEVELS.filter((lvl) => lessons.some((l) => l.level === lvl))
          .length === 0 ? (
          <p className="text-sm text-gray-400">
            Hali birorta darsga CEFR daraja belgilanmagan. Yuqorida darsga
            daraja bering, keyin shu yerda uni nomlaysiz.
          </p>
        ) : (
          <div className="space-y-4">
            {CEFR_LEVELS.filter((lvl) =>
              lessons.some((l) => l.level === lvl)
            ).map((lvl) => {
              const meta = levelMetas[lvl] || { title: "", description: "" };
              const count = lessons.filter((l) => l.level === lvl).length;
              return (
                <div key={lvl} className="border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-sky-100 text-sky-700">
                      {lvl}
                    </span>
                    <span className="text-xs text-gray-400">
                      {count} ta dars
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder={`Modul nomi (masalan "Boshlang'ich asoslar")`}
                    value={meta.title}
                    onChange={(e) => setLevelField(lvl, "title", e.target.value)}
                    className="w-full px-3 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <textarea
                    placeholder="Qisqa tavsif (ixtiyoriy)"
                    value={meta.description}
                    onChange={(e) =>
                      setLevelField(lvl, "description", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => saveLevel(lvl)}
                    disabled={savingLevel === lvl}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded text-sm transition"
                  >
                    {savingLevel === lvl ? "Saqlanmoqda…" : "Saqlash"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Boshiga qo'shish tugmasi */}
      {canCreate && lessons.length > 0 && (
        <div className="max-w-2xl mx-auto mt-10">
          <button
            onClick={() => startInsertAt("__start__")}
            className="w-full py-2.5 border-2 border-dashed border-sky-300 text-sky-600 hover:bg-sky-50 rounded-xl text-sm font-medium transition"
          >
            ＋ Ro‘yxat boshiga dars qo‘shish
          </button>
        </div>
      )}

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
                {lesson.level && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">
                    {lesson.level}
                  </span>
                )}
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
              {canEdit ? (
                <button
                  onClick={() => handleEdit(lesson)}
                  className="text-blue-600 hover:underline"
                >
                  ✏️ Tahrirlash
                </button>
              ) : (
                <span />
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="text-red-600 hover:underline"
                >
                  🗑️ O‘chirish
                </button>
              )}
            </div>

            {/* Shu darsdan keyin yangi dars qo'shish */}
            {canCreate && (
              <button
                onClick={() => startInsertAt(lesson.id)}
                className="w-full py-2 border-2 border-dashed border-sky-200 text-sky-600 hover:bg-sky-50 rounded-lg text-xs font-medium transition"
              >
                ＋ Shundan keyin dars qo‘shish
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonsPage;
