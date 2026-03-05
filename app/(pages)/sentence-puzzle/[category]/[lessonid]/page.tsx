"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Plus, Trash2, Edit, Loader2, Download, Check, X } from "lucide-react";

// Single-file modern admin UI for sentence puzzles (TailwindCSS required)
// Default export a React component so you can paste into a Next.js "app" page.

type Puzzle = {
  id: string;
  sentence: string;
  answer: string;
};

export default function SentencePuzzleAdminUI() {
  const { lessonid } = useParams();
  const API_URL = "https://api.sevenedu.store"; // change if needed
  const api = axios.create({ baseURL: API_URL, timeout: 8000 });

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sentence, setSentence] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!lessonid) return;
    fetchPuzzles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonid]);

  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, [toast]);

  const fetchPuzzles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/sentence-puzzle/${lessonid}`);
      // normalize shape if backend returns nested data
      setPuzzles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setToast("Serverdan ma'lumot olinmadi.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSentence("");
    setAnswer("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!sentence.trim() || !answer.trim()) return setToast("Bo'sh maydon qolmasin 😅");
    try {
      setSaving(true);
      if (editId) {
        // PATCH
        await api.patch(`/sentence-puzzle/${editId}`, { sentence, answer });
        setToast("Puzzle yangilandi ✅");
      } else {
        // POST
        await api.post(`/sentence-puzzle/${lessonid}/create`, { sentence, answer });
        setToast("Yangi puzzle qo'shildi 🎉");
      }
      resetForm();
      fetchPuzzles();
    } catch (err) {
      console.error(err);
      setToast("Xato yuz berdi. Konsolni tekshir 🙃");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Puzzle) => {
    setSentence(p.sentence);
    setAnswer(p.answer);
    setEditId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/sentence-puzzle/${id}`);
      setToast("O'chirildi");
    } catch (err) {
      console.error(err);
      setToast("O'chirishda xatolik 😕");
      fetchPuzzles();
    }
  };

  const handleExportCSV = () => {
    if (puzzles.length === 0) return setToast("Hech nima export qilinmaydi 🤷‍♂️");
    const header = ["id", "sentence", "answer"];
    const rows = puzzles.map((p) => [p.id, p.sentence, p.answer]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentence-puzzles_${lessonid || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("CSV yuklandi 📥");
  };

  const filtered = puzzles.filter(
    (p) =>
      p.sentence.toLowerCase().includes(query.toLowerCase()) ||
      p.answer.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header + form */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Sentence Puzzle — Admin</h1>
            <p className="text-sm text-gray-400">Lesson: <span className="text-blue-300">{lessonid || '—'}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchPuzzles(); setToast('Yangilanish...') }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white text-sm hover:scale-105 transition"
            >
              <Loader2 className="animate-spin" size={16} />
              Yangila
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm hover:scale-105 transition"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Gap yozing"
            className="md:col-span-2 p-3 rounded-lg bg-slate-900 text-white border border-gray-700 outline-none focus:border-blue-400"
          />

          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Javob"
            className="p-3 rounded-lg bg-slate-900 text-white border border-gray-700 outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:brightness-105 transition disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={16} />}
            {editId ? "Yangilash" : "Qo'shish"}
          </button>

          {editId && (
            <button
              onClick={resetForm}
              className="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
            >
              Bekor qilish
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qidiruv — gap yoki javob"
              className="p-2 rounded-lg bg-slate-900 text-white border border-gray-700 outline-none focus:border-blue-400"
            />
            <button
              onClick={() => { setSentence(''); setAnswer(''); setEditId(null); setQuery(''); }}
              className="px-3 py-2 rounded-lg bg-white/6 text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Puzzles ({puzzles.length})</h2>
          <p className="text-sm text-gray-400">Filtrlangan: {filtered.length}</p>
        </div>

        <div className="space-y-3">
          {loading ? (
            // skeleton
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-800 h-20 rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 p-8 bg-slate-800 rounded-lg">Hozircha puzzle yo‘q yoki qidiruvga mos emas.</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 p-4 bg-slate-800 rounded-xl border border-gray-700"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{p.sentence}</p>
                  <p className="text-sm text-blue-300 truncate">Javob: {p.answer}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 rounded-md bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition"
                    title="Tahrirlash"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="flex items-center gap-3 bg-white/6 border border-white/10 text-white px-4 py-2 rounded-xl shadow-lg">
            <Check size={16} />
            <span className="text-sm">{toast}</span>
          </div>
        </div>
      )}

      {/* Little footer */}
      <div className="mt-6 text-xs text-gray-500 text-center">Modern admin UI • TailwindCSS • Next.js client component</div>
    </div>
  );
}
