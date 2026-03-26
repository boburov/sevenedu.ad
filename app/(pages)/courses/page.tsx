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
      return alert("Fill all fields");

    const formData = new FormData();
    if (thumbnail) formData.append("file", thumbnail);
    formData.append("title", title);
    formData.append("goal", goal);
    formData.append("shortName", shortName);

    try {
      if (editingId) await updateCategory(editingId, formData);
      else await createCategory(formData);

      alert(`Category ${editingId ? "updated" : "created"}`);
      resetForm();
      fetchData();
    } catch (err) {
      alert("Error: " + err);
    }
  };

  const handleEdit = (c: CourseType) => {
    setEditingId(c.id);
    setTitle(c.title);
    setGoal(c.goal);
    setShortName(c.shortName);
    setPreview(c.thumbnail);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this category?")) {
      await deleteCategory(id);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* TITLE */}
        <h1 className="text-3xl font-semibold tracking-tight">
          Course Categories
        </h1>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-2xl p-6 shadow-sm space-y-4"
        >
          {/* FILE UPLOAD */}
          <label className="cursor-pointer block">
            <div className="border border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : (
                <>
                  <FileUp className="mx-auto mb-2 text-gray-400" size={40} />
                  <p className="text-sm text-gray-500">
                    Upload thumbnail
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                setThumbnail(e.target.files?.[0] || null)
              }
            />
          </label>

          {/* INPUTS */}
          <input
            type="text"
            placeholder="Title"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Short Name"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
          />

          <textarea
            placeholder="Goal"
            className="w-full border rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          {/* BUTTON */}
          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
            {editingId ? "Update Category" : "Create Category"}
          </button>
        </form>

        {/* LIST */}
        <div>
          <h2 className="text-xl font-medium mb-4">
            Existing Categories
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.map((c) => (
              <div
                key={c.id}
                className="border rounded-2xl overflow-hidden hover:shadow-md transition"
              >
                <Link href={`courses/${c.id}`}>
                  <img
                    src={c.thumbnail}
                    className="w-full h-40 object-cover"
                  />
                </Link>

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold">
                    {c.shortName}: {c.title}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {c.goal}
                  </p>

                  <p className="text-xs text-gray-400">
                    Lessons:{" "}
                    {
                      c.lessons.filter((l) => l.isVisible)
                        .length
                    }
                  </p>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="flex items-center gap-1 text-indigo-600 hover:underline"
                    >
                      <Pencil size={16} /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="flex items-center gap-1 text-red-500 hover:underline"
                    >
                      <Trash size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CoursesPage;