"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

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

  // ✅ useCallback bilan o‘rab qo‘yildi
  const fetchVocabulary = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://api.sevenedu.store/dictonary/lesson/${lesson_id}`,
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
        `https://api.sevenedu.store/dictonary/${lesson_id}/add`,
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
                    <td className="px-4 py-3 text-gray-100 border-b border-gray-700 font-medium">
                      {item.word}
                    </td>
                    <td className="px-4 py-3 text-green-400 border-b border-gray-700">
                      {item.translated}
                    </td>
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
