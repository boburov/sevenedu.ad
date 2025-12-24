"use client";

import { useEffect, useState } from "react";
import {
  allCourse,
  deleteCategory,
  updateCategory,
} from "@/app/api/service/api";
import { Trash, Pencil, BookPlus, ArrowUp } from "lucide-react";
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

const DictionaryPage = () => {
  const [course, setCourse] = useState<CourseType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    goal: "",
    shortName: "",
    file: null as File | null,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fetchData = async () => {
    const res = await allCourse();
    setCourse(res.data || []);
  };

  useEffect(() => {
    fetchData();
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEdit = (c: CourseType) => {
    setEditingId(c.id);
    setEditData({
      title: c.title,
      goal: c.goal,
      shortName: c.shortName,
      file: null,
    });
  };

  const handleUpdateSubmit = async () => {
    if (!editingId) return;
    const formData = new FormData();
    formData.append("title", editData.title);
    formData.append("goal", editData.goal);
    formData.append("shortName", editData.shortName);
    if (editData.file) formData.append("file", editData.file);

    try {
      await updateCategory(editingId, formData);
      setEditingId(null);
      fetchData();
      alert("Muvaffaqiyatli tahrirlandi");
    } catch (err) {
      alert("Xatolik: " + err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ushbu kursni o'chirmoqchimisiz?")) {
      await deleteCategory(id);
      fetchData();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen py-10 px-6 text-white relative">
      {editingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#1a1b2f] text-white rounded-xl p-6 shadow-2xl w-full max-w-lg border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">
              Kursni tahrirlash
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Sarlavha"
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
                className="w-full p-2 rounded-md bg-[#2a2b3d] text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <input
                type="text"
                placeholder="Maqsad"
                value={editData.goal}
                onChange={(e) =>
                  setEditData({ ...editData, goal: e.target.value })
                }
                className="w-full p-2 rounded-md bg-[#2a2b3d] text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <input
                type="text"
                placeholder="Qisqa nom"
                value={editData.shortName}
                onChange={(e) =>
                  setEditData({ ...editData, shortName: e.target.value })
                }
                className="w-full p-2 rounded-md bg-[#2a2b3d] text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <input
                type="file"
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="w-full text-sm text-purple-300"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition text-sm"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white transition text-sm"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {course.map((c) => {
          return (
            <div
              key={c.id}
              className="bg-[#1a1b2f] border border-purple-800/40 rounded-2xl shadow-lg hover:scale-[1.015] transition transform duration-200 overflow-hidden flex flex-col"
            >
              <img
                src={c.thumbnail}
                alt={c.title}
                width={500}
                height={300}
                className="w-full h-40 object-cover"
              />
              <div className="flex flex-col justify-between p-4 flex-1">
                <div>
                  <h3 className="text-base font-bold text-green-400">
                    {c.shortName}: {c.title}
                  </h3>
                  <p className="text-sm text-purple-200 mt-1 line-clamp-2">
                    {c.goal}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Darslar soni:{" "}
                    <strong>
                      {c.lessons.filter((d) => d.isVisible === true).length}
                    </strong>
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Link
                    href={`dictionary/${c.id}`}
                    className="flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs rounded-lg transition"
                  >
                    <BookPlus size={14} /> Lug‘at
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="text-purple-400 hover:text-purple-300 transition"
                      title="Tahrirlash"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-400 transition"
                      title="O‘chirish"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-2 rounded-full shadow-md hover:bg-purple-700 transition"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
};

export default DictionaryPage;
