"use client";

import { useEffect, useState } from "react";
import {
  allCourse,
  deleteCategory,
  updateCategory,
} from "@/app/api/service/api";
import { Trash, Pencil, BookPlus, ArrowUp, Search, X, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    goal: "",
    shortName: "",
    file: null as File | null,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const router = useRouter();

  const fetchData = async () => {
    const res = await allCourse();
    setCourse(res.data || []);
    setFilteredCourses(res.data || []);
  };

  useEffect(() => {
    fetchData();
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let result = course;

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.goal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "lessons") {
        return (
          b.lessons.filter((l) => l.isVisible).length -
          a.lessons.filter((l) => l.isVisible).length
        );
      } else if (sortBy === "shortName") {
        return a.shortName.localeCompare(b.shortName);
      }
      return 0;
    });

    setFilteredCourses(result);
  }, [searchQuery, course, sortBy]);

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
    if (confirm("Ushbu kursni o&apos;chirmoqchimisiz?")) {
      await deleteCategory(id);
      fetchData();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageClick = (id: string) => {
    router.push(`/relocation/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 md:px-8 relative">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Kurslar Lug&apos;ati
            </h1>
            <p className="text-gray-400 mt-2">
              Barcha mavjud kurslarni boshqaring
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
              >
                <option value="title">Nomi bo&apos;yicha</option>
                <option value="shortName">Qisqa nomi</option>
                <option value="lessons">Darslar soni</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Barcha Kurslar</h2>
            <span className="bg-purple-900 text-purple-100 text-sm font-medium px-3 py-1 rounded-full">
              {filteredCourses.length} ta kurs
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookPlus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Kurslar topilmadi
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Qidiruv bo&apos;yicha hech narsa topilmadi"
                  : "Hali kurslar qo&apos;shilmagan"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col group hover:border-purple-500/30"
                >
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    onClick={() => handleImageClick(c.id)}
                  >
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      width={500}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-purple-300 shadow-sm">
                      {c.lessons.filter((d) => d.isVisible === true).length}{" "}
                      dars
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                      <div className="bg-purple-600/90 text-white rounded-full p-2">
                        <Eye size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-4 flex-1">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
                          {c.shortName}
                        </h3>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {c.title}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {c.goal}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
                      <Link
                        href={`dictionary/${c.id}`}
                        className="flex items-center gap-1.5 text-white bg-purple-600 hover:bg-purple-700 px-3 py-2 text-sm rounded-lg transition-colors"
                      >
                        <BookPlus size={14} /> Lug&apos;at
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Kursni tahrirlash
              </h2>
              <button
                onClick={() => setEditingId(null)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sarlavha
                </label>
                <input
                  type="text"
                  placeholder="Kurs sarlavhasi"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Maqsad
                </label>
                <input
                  type="text"
                  placeholder="Kurs maqsadi"
                  value={editData.goal}
                  onChange={(e) =>
                    setEditData({ ...editData, goal: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Qisqa nom
                </label>
                <input
                  type="text"
                  placeholder="Qisqa nomi"
                  value={editData.shortName}
                  onChange={(e) =>
                    setEditData({ ...editData, shortName: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rasmni yangilash (ixtiyoriy)
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-900 file:text-purple-100 hover:file:bg-purple-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <button
                onClick={() => setEditingId(null)}
                className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors text-sm font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm font-medium"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-40"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default DictionaryPage;
