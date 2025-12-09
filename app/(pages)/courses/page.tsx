"use client";

import { useEffect, useState } from "react";
import {
  allCourse,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/api/service/api";
import { FileUp, Trash, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseType {
  id: string;
  title: string;
  goal: string;
  shortName: string;
  thumbnail: string;
  lessons: { id: string; isVisible: boolean }[];
}

const CoursesPage = () => {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [shortName, setShortName] = useState("");
  const [course, setCourse] = useState<CourseType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setGoal("");
    setShortName("");
    setThumbnail(null);
    setPreview(null);
    setEditingId(null);
  };

  const fetchData = async () => {
    const res = await allCourse();
    setCourse(res.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (thumbnail) {
      const url = URL.createObjectURL(thumbnail);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [thumbnail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !goal || !shortName)
      return alert("Barcha maydonlarni to‘ldiring");

    const formData = new FormData();
    if (thumbnail) formData.append("file", thumbnail);
    formData.append("title", title);
    formData.append("goal", goal);
    formData.append("shortName", shortName);

    try {
      if (editingId) await updateCategory(editingId, formData);
      else await createCategory(formData);
      alert(`Kategoriya ${editingId ? "yangilandi" : "yaratildi"}`);
      resetForm();
      fetchData();
    } catch (err) {
      alert("Xatolik: " + err);
    }
  };

  const handleEdit = (c: CourseType) => {
    setEditingId(c.id);
    setTitle(c.title);
    setGoal(c.goal);
    setShortName(c.shortName);
    setPreview(
      c.thumbnail?.startsWith("/images")
        ? c.thumbnail
        : `/images/${c.thumbnail}`
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm("O'chirishni xohlaysizmi?")) {
      await deleteCategory(id);
      fetchData();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#15161d] text-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <h2 className="text-3xl font-bold text-center">🧩 Kurs Kategoriyasi</h2>

        <form
          onSubmit={handleSubmit}
          className="glass p-6 rounded-2xl border border-white/20 backdrop-blur-md bg-white/10 shadow-lg space-y-4"
        >
          <label htmlFor="file" className="cursor-pointer">
            <div className="border-2 border-dashed p-4 rounded-lg text-center hover:bg-white/5 transition">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={160}
                  className="w-full h-40 object-cover rounded-md"
                />
              ) : (
                <>
                  <FileUp className="w-16 h-16 mx-auto text-white/70" />
                  <p className="text-white/60">Rasm yuklash</p>
                </>
              )}
            </div>
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            id="file"
            className="hidden"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          />

          <input
            type="text"
            placeholder="Kategoriya sarlavhasi"
            className="input glass mt-5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Qisqa nom"
            className="input glass"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
          />
          <textarea
            placeholder="Maqsad"
            className="input glass resize-none"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium"
          >
            {editingId ? "Yangilash" : "Yaratish"}
          </button>
        </form>

        <h2 className="text-xl mt-6 mb-2 font-semibold text-white/80">
          📚 Mavjud Kategoriyalar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {course.map((c) => (
            <div
              key={c.id}
              className="glass p-4 rounded-2xl backdrop-blur-md bg-white/10 shadow-lg hover:scale-[1.02] transition space-y-3"
            >
              <Link href={`courses/${c.id}`}>
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  width={400}
                  height={144}
                  className="w-full h-36 object-cover rounded-xl"
                />
              </Link>
              <h3 className="text-lg font-semibold">
                {c.shortName}: {c.title}
              </h3>
              <p className="text-sm text-white/60">{c.goal}</p>
              <p className="text-sm text-white/50">
                Darslar soni: {c.lessons.filter((d) => d.isVisible).length}
              </p>
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-200"
                >
                  <Pencil size={18} /> Tahrirlash
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="flex items-center gap-1 text-red-400 hover:text-red-200"
                >
                  <Trash size={18} /> O‘chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
