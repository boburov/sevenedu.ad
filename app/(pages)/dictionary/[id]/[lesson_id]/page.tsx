"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/api/service/api";
import { usePermissions } from "@/app/lib/permissions";

interface VocabularyItem {
  id: string;
  word: string;
  translated: string;
  lessonsId: string;
}

export default function DictonaryPage() {
  const { lesson_id } = useParams() as { lesson_id: string };
  const [words, setWords] = useState([{ word: "", translated: "" }]);
  const [loading, setLoading] = useState(false);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loadingVocab, setLoadingVocab] = useState(true);
  const [editing, setEditing] = useState<VocabularyItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const { can } = usePermissions();
  const canEdit = can("dictionary", "edit");

  // ✅ useCallback bilan o‘rab qo‘yildi
  const fetchVocabulary = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/dictonary/lesson/${lesson_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setVocabulary(res.data);
    } catch (err) {
      console.error("Lug&apos;atlarni olishda xatolik:", err);
    } finally {
      setLoadingVocab(false);
    }
  }, [lesson_id]);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]); // ✅ endi warning yo‘q

  const handleChange = (index: number, field: string, value: string) => {
    const newWords = [...words];
    newWords[index][field as "word" | "translated"] = value;
    setWords(newWords);
  };

  const addRow = () => setWords([...words, { word: "", translated: "" }]);
  const removeRow = (index: number) =>
    setWords(words.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/dictonary/${lesson_id}/add`,
        { items: words },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(res.data.message || "So&apos;zlar qo&apos;shildi!");
      setWords([{ word: "", translated: "" }]);
      fetchVocabulary();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Xatolik yuz berdi");
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing || savingEdit || !canEdit) return;

    const word = editing.word.trim();
    const translated = editing.translated.trim();
    if (!word || !translated) {
      setEditError("So‘z va tarjimani kiriting.");
      return;
    }

    setEditError("");
    setSavingEdit(true);
    try {
      const { data } = await axios.patch<VocabularyItem>(
        `${API_BASE_URL}/dictonary/${editing.id}`,
        { word, translated },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setVocabulary((items) =>
        items.map((item) => (item.id === editing.id ? data : item))
      );
      setEditing(null);
      await fetchVocabulary();
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message;
      setEditError(typeof message === "string" ? message : "So‘zni saqlab bo‘lmadi.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="p-6 px-40 mx-auto text-gray-100 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-green-400">
        📚 Yangi so&apos;zlarni qo&apos;shish ({lesson_id})
      </h2>

      {/* So'z qo'shish formasi */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {words.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 items-center bg-gray-800 p-4 rounded-xl shadow"
          >
            <input
              type="text"
              placeholder="Word"
              value={item.word}
              onChange={(e) => handleChange(index, "word", e.target.value)}
              className="flex-1 border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="text"
              placeholder="Translated"
              value={item.translated}
              onChange={(e) =>
                handleChange(index, "translated", e.target.value)
              }
              className="flex-1 border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
            {words.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="px-3 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50"
              >
                ❌
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addRow}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            ➕ Yana qo&apos;shish
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Yuklanmoqda..." : "✅ Saqlash"}
          </button>
        </div>
      </form>

      {/* Pastki qismda lug'atlar jadvali */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4 text-green-300">
          📋 Mavjud lug&apos;atlar
        </h3>

        {loadingVocab ? (
          <p className="text-gray-400 animate-pulse">⏳ Yuklanmoqda...</p>
        ) : vocabulary.length === 0 ? (
          <p className="text-gray-500">Lug&apos;atlar hozircha yo&apos;q.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow border border-gray-700">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-800/80 text-green-300">
                  <th className="px-4 py-3 text-sm font-semibold border-b border-gray-700">
                    #
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold border-b border-gray-700">
                    Word
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold border-b border-gray-700">
                    Translation
                  </th>
                  {canEdit && (
                    <th className="px-4 py-3 text-sm font-semibold border-b border-gray-700">
                      Amal
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {vocabulary.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-gray-800/40" : "bg-gray-700/30"
                    } hover:bg-green-900/30`}
                  >
                    <td className="px-4 py-3 text-gray-400 border-b border-gray-700 text-center">
                      {index + 1}
                    </td>
                    {canEdit && editing?.id === item.id ? (
                      <td colSpan={3} className="px-4 py-3 border-b border-gray-700">
                        <form onSubmit={handleUpdate}>
                          <fieldset disabled={savingEdit} className="flex flex-wrap items-end gap-3">
                            <label className="flex flex-col gap-1">
                              So‘z
                              <input
                                required
                                value={editing.word}
                                onChange={(e) => setEditing({ ...editing, word: e.target.value })}
                                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2"
                              />
                            </label>
                            <label className="flex flex-col gap-1">
                              Tarjima
                              <input
                                required
                                value={editing.translated}
                                onChange={(e) => setEditing({ ...editing, translated: e.target.value })}
                                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2"
                              />
                            </label>
                            <button type="submit" className="rounded-lg bg-green-600 px-3 py-2 text-white disabled:opacity-50">
                              {savingEdit ? "Saqlanmoqda…" : "Saqlash"}
                            </button>
                            <button type="button" onClick={() => setEditing(null)} className="rounded-lg bg-gray-700 px-3 py-2 disabled:opacity-50">
                              Bekor qilish
                            </button>
                          </fieldset>
                          {editError && <p role="alert" className="mt-2 text-sm text-red-400">{editError}</p>}
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-gray-100 border-b border-gray-700 font-medium">
                          {item.word}
                        </td>
                        <td className="px-4 py-3 text-green-400 border-b border-gray-700">
                          {item.translated}
                        </td>
                        {canEdit && (
                          <td className="px-4 py-3 text-center border-b border-gray-700">
                            <button
                              type="button"
                              disabled={editing !== null || savingEdit}
                              onClick={() => {
                                setEditError("");
                                setEditing(item);
                              }}
                              className="rounded-lg bg-gray-700 px-3 py-2 hover:bg-gray-600 disabled:opacity-50"
                            >
                              Tahrirlash
                            </button>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
